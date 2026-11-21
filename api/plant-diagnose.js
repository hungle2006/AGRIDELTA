/* Vercel Node Function for optional Gemini image triage.
 * Never expose GEMINI_API_KEY to the browser.
 * No synthetic diagnosis when the external provider is unavailable.
 */
export const maxDuration = 30;
const output=(res,status,obj)=>{
  res.setHeader("Cache-Control","no-store");
  res.setHeader("Content-Type","application/json; charset=utf-8");
  return res.status(status).json(obj);
};
const clean=(v,limit=420)=>typeof v==="string"?v.slice(0,limit).trim():"";
const cleanList=(v)=>Array.isArray(v)?v.filter(x=>typeof x==="string").slice(0,5).map(x=>clean(x,240)):[];
export default async function handler(req,res){
  if(req.method!=="POST") {
    res.setHeader("Allow","POST");
    return output(res,405,{error:"Chỉ hỗ trợ POST"});
  }
  if(!process.env.GEMINI_API_KEY) return output(res,503,{error:"AI_NOT_CONFIGURED",message:"Cần GEMINI_API_KEY trong Vercel Environment Variables"});
  let body=req.body||{};
  if(typeof body==="string"){try{body=JSON.parse(body);}catch{return output(res,400,{error:"JSON không hợp lệ"});}}
  const {image,mimeType,crop}=body;
  if(mimeType!=="image/jpeg"||typeof image!=="string"||image.length<80||image.length>4_500_000||!/^[A-Za-z0-9+/]+={0,2}$/.test(image)){
    return output(res,400,{error:"Ảnh JPEG hoặc kích thước không hợp lệ (tối đa khoảng 3 MB)"});
  }
  const plant=clean(crop,45)||"cây trồng";
  const prompt=[
    "Bạn là trợ lý sàng lọc dấu hiệu bất thường trên cây trồng, KHÔNG phải chuyên gia đã kiểm tra trực tiếp.",
    "Loại cây do người dùng khai báo: "+plant+".",
    "Nhìn ảnh và xác định có thấy cây/lá thật hay không. Nếu ảnh mờ hoặc không đủ căn cứ, condition='Không đủ dữ liệu để xác định'.",
    "Không được khẳng định chắc chắn nguyên nhân sâu bệnh từ ảnh đơn lẻ. Nêu các khả năng phân biệt và điều kiện cần kiểm tra.",
    "Không đưa tên, liều lượng, cách pha hoặc hướng dẫn sử dụng thuốc BVTV/hóa chất.",
    "Chỉ trả về JSON hợp lệ gồm condition (chuỗi), explanation (chuỗi), checks (mảng 2-4 chuỗi), actions (mảng 2-4 chuỗi), uncertainty (chuỗi).",
    "Đưa lời khuyên theo tiếng Việt rõ ràng, ngắn, hướng quan sát thực địa và khuyến nghị chuyên gia nông nghiệp khi bệnh nặng."
  ].join("\n");
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),25000);
  try{
    const model=process.env.GEMINI_MODEL||"gemini-2.5-flash";
    if(!/^[a-zA-Z0-9_.-]{1,80}$/.test(model))throw new Error("MODEL_NAME_INVALID");
    const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent",{
      method:"POST",signal:controller.signal,
      headers:{"Content-Type":"application/json","x-goog-api-key":process.env.GEMINI_API_KEY},
      body:JSON.stringify({
        contents:[{role:"user",parts:[{text:prompt},{inline_data:{mime_type:mimeType,data:image}}]}],
        generationConfig:{temperature:.12,responseMimeType:"application/json",maxOutputTokens:1150}
      })
    });
    if(!response.ok) return output(res,502,{error:"AI_PROVIDER_ERROR",message:"Dịch vụ phân tích ảnh hiện không phản hồi"});
    const payload=await response.json();
    const raw=(payload.candidates?.[0]?.content?.parts||[]).filter(x=>typeof x.text==="string").map(x=>x.text).join("");
    let parsed;
    try{parsed=JSON.parse(raw);}catch{return output(res,502,{error:"AI_OUTPUT_INVALID",message:"Phản hồi AI không đúng định dạng"});}
    if(!parsed||typeof parsed!=="object"||!clean(parsed.condition))return output(res,502,{error:"AI_OUTPUT_INVALID"});
    return output(res,200,{
      condition:clean(parsed.condition,140),
      explanation:clean(parsed.explanation,650),
      checks:cleanList(parsed.checks),
      actions:cleanList(parsed.actions),
      uncertainty:clean(parsed.uncertainty,350)||"Kết luận sơ bộ qua ảnh, không thay cho chuyên gia kiểm tra trực tiếp."
    });
  }catch(e){
    const timeout=e?.name==="AbortError";
    return output(res,timeout?504:500,{error:timeout?"AI_TIMEOUT":"AI_UNAVAILABLE",message:timeout?"Phân tích ảnh quá thời gian":"Không thể xử lý ảnh ở thời điểm này"});
  }finally{clearTimeout(timer);}
}

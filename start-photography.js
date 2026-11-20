/** Ten distinct Unsplash Free editorial photographs, with local image fallbacks. */
const photo=(id,alt,fallback,credit,source)=>Object.freeze({id,alt,fallback,credit,source,url:'https://images.unsplash.com/'+id});
export const START_IMAGES=Object.freeze({
 hero: photo('photo-1721292175149-8a929b7635f7','Nắng trên cánh đồng trồng trọt xanh','/assets/start-field-sunrise.webp','Austin','https://unsplash.com/photos/sun-setting-over-a-field-of-green-crops-hnmqECheIkQ'),
 workflow:Object.freeze([
  photo('photo-1775931438381-7827b44e2ba3','Các luống cây trồng nhìn từ trên cao','/assets/start-feature-fields.webp','Bernd Dittrich','https://unsplash.com/photos/aerial-view-of-a-farm-field-with-rows-of-crops-u-epjX1aCd8'),
  photo('photo-1706862609885-7771b001daa2','Máy kéo gieo hạt trên cánh đồng lúc hoàng hôn','/assets/start-workflow-season.webp','Tomas Hudolin','https://unsplash.com/photos/a-tractor-is-driving-through-a-field-at-sunset-9EmU19DzXxg'),
  photo('photo-1777045453382-330fdba28dc1','Người nông dân chăm cây và tưới nước trên ruộng','/assets/start-feature-tasks.webp','Toffi Teraytay','https://unsplash.com/photos/farmer-watering-crops-in-a-muddy-field-gR2k46B-TWk')
 ]),
 features:Object.freeze([
  photo('photo-1622383563227-04401ab4e5ea','Đôi tay đang trồng cây con vào đất','/assets/start-feature-fields.webp','Jonathan Kemper','https://unsplash.com/photos/gloved-hands-planting-seedling-in-soil-CbZh3kaPxrE'),
  photo('photo-1762871673363-83dbb1ffc26f','Mặt trời lên trên các cánh đồng và núi','/assets/start-feature-seasons.webp','Mario Beducci','https://unsplash.com/photos/sunrise-over-a-misty-agricultural-field-and-hills-6PYLI97vGS0'),
  photo('photo-1566218246241-934ad8b38ea6','Hàng cây cà chua trồng trong nhà kính','/assets/start-feature-tasks.webp','Markus Spiske','https://unsplash.com/photos/a-long-row-of-tomatoes-growing-in-a-greenhouse-9cHVqn9bBpQ'),
  photo('photo-1758552219061-5148ccb5bc5d','Cà chua chín đỏ trên thân cây','/assets/start-feature-observation.webp','Chris Weiher','https://unsplash.com/photos/ripe-tomatoes-growing-on-a-vine-hQXXWiG68YQ'),
  photo('photo-1624668430039-0175a0fbf006','Giỏ đầy cà chua và các loại rau vừa thu hoạch','/assets/start-feature-orders.webp','Zoe Richardson','https://unsplash.com/photos/harvest-basket-with-tomatoes-and-vegetables-hmoDcZnB7uw')
 ]),
 closing:photo('photo-1714588419523-2c3bd48898f0','Cảnh cánh đồng xanh và hàng cây nhìn từ trên cao','/assets/start-field-sunrise.webp','Bernd Dittrich','https://unsplash.com/photos/an-aerial-view-of-a-green-field-with-trees-rsPCddfrCjg')
});
export const startPhotos=()=>[START_IMAGES.hero,...START_IMAGES.workflow,...START_IMAGES.features,START_IMAGES.closing];
export function startPhoto(p,cls='',sizes='(max-width:760px) 100vw, 40vw'){
 const src=(w,q=82)=>p.url+'?auto=format&fit=crop&w='+w+'&q='+q;
 return '<img class="'+cls+'" alt="'+p.alt+'" src="'+src(960)+'" srcset="'+
 [480,820,1280,1760].map(w=>src(w)+' '+w+'w').join(', ')+
 '" sizes="'+sizes+'" width="1280" height="800" loading="lazy" decoding="async" data-photo-fallback="'+p.fallback+'">';
}

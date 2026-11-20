import {expect,test} from '@playwright/test';

const demo = page => page.getByRole('button',{name:'Vào bản dùng thử',exact:true}).click();
const widths = [320,360,390,430,768,1024,1440,1920];
const sizes = [...widths.map(width => ({width,height:width<800?844:950})), {width:844,height:390}];
const directions = [
  ['Quản lý cánh đồng','Mở cánh đồng','Cánh đồng'],
  ['Quản lý mùa vụ','Mở mùa vụ','Mùa vụ'],
  ['Công việc hằng ngày','Mở công việc','Công việc'],
  ['Quan sát cây trồng','Mở quan sát','Quan sát cây trồng'],
  ['Quản lý đơn hàng','Mở đơn hàng','Đơn hàng'],
];

function noOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
}

for (const viewport of sizes) {
  test(`Start, roots, workspace and form fit ${viewport.width}×${viewport.height}`,async ({page}) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('#live-earth')).toHaveAttribute('data-scene-state','ready',{timeout:20000});
    expect(await noOverflow(page)).toBe(true);
    await page.getByRole('link',{name:'Khám phá bộ rễ'}).click();
    await expect(page.locator('.garden-node[aria-hidden=false]')).toHaveCount(5);
    const aligned = await page.locator('.garden-viewport').evaluate(viewport => {
      const frame = viewport.getBoundingClientRect();
      return [...viewport.querySelectorAll('.garden-node')].every(node => {
        const r=node.getBoundingClientRect();
        return r.left>=frame.left-1&&r.right<=frame.right+1&&r.top>=frame.top-1&&r.bottom<=frame.bottom+1;
      });
    });
    expect(aligned).toBe(true);
    await demo(page);
    await expect(page.getByRole('heading',{name:'Khu vườn của bạn'})).toBeVisible();
    expect(await noOverflow(page)).toBe(true);
    await page.getByRole('button',{name:'Thêm khu canh tác',exact:true}).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
}

test('camera reverses and all five nodes route to working modules', async ({page}) => {
  await page.setViewportSize({width:1440,height:910});
  const errors=[];
  page.on('pageerror',error => errors.push(error.message));
  await page.goto('/');
  const figure=page.locator('.garden-figure');
  await expect(figure).toHaveAttribute('data-root-view','false');
  for (const [node, action, heading] of directions) {
    await page.getByRole('link',{name:'Khám phá bộ rễ'}).click();
    await expect(figure).toHaveAttribute('data-root-view','true');
    await page.getByRole('button',{name:node,exact:true}).click();
    await expect(page.getByRole('heading',{name:node,exact:true})).toBeVisible();
    await page.getByRole('button',{name:action,exact:true}).click();
    await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Trở về cảnh cây',exact:true}).click();
    await expect(figure).toHaveAttribute('data-root-view','false');
  }
  expect(errors).toEqual([]);
});

test('automatic lifecycle plays, pauses, replays and has no manual care buttons',async ({page}) => {
  await page.goto('/');
  const scene = page.locator('#live-earth');
  await expect(scene).toHaveAttribute('data-growth-state','GERMINATING',{timeout:20000});
  expect(await page.locator('[data-care]').count()).toBe(0);
  await page.getByRole('button',{name:'Tạm dừng cây phát triển',exact:true}).click();
  await expect(page.getByRole('button',{name:'Tiếp tục cây phát triển',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Kết quả',exact:true}).click();
  await expect(scene).toHaveAttribute('data-growth-state','FRUITING');
  await expect(page.getByRole('button',{name:'Kết quả',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Xem lại quá trình cây phát triển',exact:true}).click();
  await expect(scene).toHaveAttribute('data-growth-state','SEED');
});

test('demo records, filters, updates and observation photo persist across reload',async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await demo(page);
  const navigation = page.getByRole('navigation',{name:'Các chức năng quản lý'});
  await navigation.getByRole('button',{name:'Cánh đồng',exact:true}).click();
  await page.getByRole('button',{name:'Thêm khu canh tác',exact:true}).click();
  await page.getByLabel('Tên khu canh tác',{exact:true}).fill('Khu QA');
  await page.getByLabel('Loại cây trồng').fill('Cà chua');
  await page.getByLabel('Diện tích').fill('1 ha');
  await page.getByRole('button',{name:'Lưu khu canh tác'}).click();
  await page.getByRole('searchbox').fill('khu qa');
  await expect(page.getByRole('heading',{name:'Khu QA'})).toBeVisible();
  await page.getByRole('button',{name:'Chi tiết',exact:true}).click();
  await page.getByRole('button',{name:'Sửa',exact:true}).click();
  await page.getByRole('dialog').locator('select[name=status]').selectOption('Ổn định');
  await page.getByRole('button',{name:'Lưu khu canh tác'}).click();
  await expect(page.getByText('Ổn định',{exact:true})).toBeVisible();
  await navigation.getByRole('button',{name:'Mùa vụ',exact:true}).click();
  await page.getByRole('button',{name:'Thêm mùa vụ',exact:true}).click();
  await page.getByLabel('Tên mùa vụ',{exact:true}).fill('Vụ cà chua QA');
  await page.getByLabel('Khu vực',{exact:true}).fill('Khu QA');
  await page.getByLabel('Ngày bắt đầu',{exact:true}).fill('2026-11-20');
  await page.getByRole('button',{name:'Lưu mùa vụ',exact:true}).click();
  await expect(page.getByRole('button',{name:'Vụ cà chua QA',exact:true})).toBeVisible();
  await navigation.getByRole('button',{name:'Công việc',exact:true}).click();
  await page.getByRole('button',{name:'Hoàn thành Kiểm tra độ ẩm đất',exact:true}).click();
  await expect(page.getByRole('button',{name:'Mở lại Kiểm tra độ ẩm đất',exact:true})).toBeVisible();
  await navigation.getByRole('button',{name:'Đơn hàng',exact:true}).click();
  await page.getByRole('button',{name:'Thêm đơn hàng'}).click();
  await page.getByLabel('Sản phẩm',{exact:true}).fill('Cà chua QA');
  await page.getByLabel('Khách hàng',{exact:true}).fill('Khách QA');
  await page.getByLabel('Số lượng',{exact:true}).fill('3 kg');
  await page.getByRole('dialog').locator('select[name=status]').selectOption('Đang chuẩn bị');
  await page.getByRole('button',{name:'Lưu đơn hàng'}).click();
  await page.locator('#record-filter').selectOption('Đang chuẩn bị');
  await expect(page.getByRole('button',{name:'Cà chua QA',exact:true})).toBeVisible();
  await navigation.getByRole('button',{name:'Quan sát',exact:true}).click();
  await page.getByRole('button',{name:'Ghi quan sát'}).click();
  await page.getByLabel('Tên quan sát').fill('Lá mới QA');
  await page.getByLabel('Khu vực',{exact:true}).fill('Khu QA');
  await page.getByLabel('Ngày quan sát',{exact:true}).fill('2026-11-20');
  await page.getByLabel('Ghi chú',{exact:true}).fill('Lá mới khỏe.');
  await page.locator('#farm-image').setInputFiles('public/assets/guide-observation.webp');
  await expect(page.getByRole('img',{name:'Xem trước ảnh',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Lưu quan sát'}).click();
  await expect(page.getByRole('button',{name:'Lá mới QA',exact:true})).toBeVisible();
  await page.reload();
  await demo(page);
  await navigation.getByRole('button',{name:'Quan sát',exact:true}).click();
  await page.getByRole('button',{name:'Lá mới QA',exact:true}).click();
  await expect(page.getByRole('img',{name:'Ảnh từ lần quan sát này',exact:true})).toBeVisible();
});

test('keyboard, menu and account correctly distinguish public and demo flows',async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.getByRole('button',{name:'Mở menu'}).click();
  await expect(page.getByRole('link',{name:'Tính năng',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('link',{name:'Tính năng',exact:true})).toBeHidden();
  await page.getByRole('button',{name:'Tìm tính năng'}).click();
  await page.getByRole('searchbox').fill('mua vu');
  await expect(page.getByRole('dialog').getByRole('button',{name:'Quản lý mùa vụ',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('.garden-header').getByRole('button',{name:'Tài khoản',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Tài khoản AGRIDELTA'})).toBeVisible();
  expect(await page.locator('input[type=password]').count()).toBe(0);
  await demo(page);
  await expect(page.getByText('Không gian canh tác · Dùng thử')).toBeVisible();
});

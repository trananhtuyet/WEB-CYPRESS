# Selenium Test Cases

Tai lieu nay mo ta cac test case Selenium theo 5 tieu chi thong nhat:

1. Ma test case
2. Muc tieu kiem thu
3. Dieu kien tien quyet
4. Cac buoc thuc hien
5. Ket qua mong doi

## Module Login

### TC_SE_LOGIN_01
- Ma test case: `TC_SE_LOGIN_01`
- Muc tieu kiem thu: Kiem tra nguoi dung dang nhap thanh cong bang tai khoan hop le.
- Dieu kien tien quyet:
  - Frontend va backend dang chay.
  - He thong cho phep dang ky tai khoan moi.
- Cac buoc thuc hien:
  1. Truy cap trang dang ky.
  2. Tao mot tai khoan moi hop le.
  3. Dang xuat khoi he thong.
  4. Truy cap trang dang nhap.
  5. Nhap email va mat khau vua tao.
  6. Nhan nut `Dang nhap`.
- Ket qua mong doi:
  1. He thong dang nhap thanh cong.
  2. Trinh duyet duoc dieu huong ra khoi trang `/login`.
  3. Hien thi nut `Dang xuat`.

### TC_SE_LOGIN_02
- Ma test case: `TC_SE_LOGIN_02`
- Muc tieu kiem thu: Kiem tra nguoi dung dang xuat thanh cong sau khi dang nhap.
- Dieu kien tien quyet:
  - Nguoi dung da dang nhap thanh cong.
- Cac buoc thuc hien:
  1. Nhan nut `Dang xuat`.
- Ket qua mong doi:
  1. He thong dang xuat thanh cong.
  2. Trinh duyet dieu huong ve trang `/login`.

## Module Register

### TC_SE_REGISTER_01
- Ma test case: `TC_SE_REGISTER_01`
- Muc tieu kiem thu: Kiem tra dang ky tai khoan moi hop le.
- Dieu kien tien quyet:
  - Frontend va backend dang chay.
  - Email dang ky chua ton tai trong he thong.
- Cac buoc thuc hien:
  1. Truy cap trang dang ky.
  2. Nhap ho ten, so dien thoai, email va mat khau hop le.
  3. Nhan nut `Dang ky`.
- Ket qua mong doi:
  1. Tai khoan moi duoc tao thanh cong.
  2. He thong dang nhap ngay sau khi dang ky.
  3. Hien thi nut `Dang xuat` tren giao dien.

### TC_SE_REGISTER_02
- Ma test case: `TC_SE_REGISTER_02`
- Muc tieu kiem thu: Kiem tra dang nhap lai bang tai khoan vua dang ky.
- Dieu kien tien quyet:
  - Tai khoan moi da duoc tao thanh cong.
- Cac buoc thuc hien:
  1. Dang xuat khoi he thong.
  2. Truy cap trang dang nhap.
  3. Nhap thong tin tai khoan vua dang ky.
  4. Nhan nut `Dang nhap`.
- Ket qua mong doi:
  1. Dang nhap thanh cong.
  2. He thong dieu huong vao khu vuc nguoi dung.

## Module Search

### TC_SE_SEARCH_01
- Ma test case: `TC_SE_SEARCH_01`
- Muc tieu kiem thu: Kiem tra tim kiem san pham bang tu khoa hop le.
- Dieu kien tien quyet:
  - Trang chu hien thi danh sach san pham.
- Cac buoc thuc hien:
  1. Truy cap trang chu.
  2. Nhap tu khoa tim kiem vao o search.
  3. Nhan Enter hoac nut tim kiem.
- Ket qua mong doi:
  1. Trang duoc cap nhat theo tu khoa tim kiem.
  2. Danh sach san pham hien thi phu hop voi tu khoa.

## Module Favorites

### TC_SE_FAVORITES_01
- Ma test case: `TC_SE_FAVORITES_01`
- Muc tieu kiem thu: Kiem tra them san pham vao danh sach yeu thich.
- Dieu kien tien quyet:
  - Nguoi dung da dang nhap.
  - Trang chu co it nhat mot san pham that.
- Cac buoc thuc hien:
  1. Truy cap trang chu.
  2. Nhan nut yeu thich tren san pham dau tien.
  3. Mo trang `San pham yeu thich`.
- Ket qua mong doi:
  1. So luong yeu thich tren header tang len.
  2. San pham vua chon xuat hien trong danh sach yeu thich.

## Module Cart

### TC_SE_CART_01
- Ma test case: `TC_SE_CART_01`
- Muc tieu kiem thu: Kiem tra them san pham vao gio hang thanh cong.
- Dieu kien tien quyet:
  - Nguoi dung da dang nhap voi vai tro `user`.
  - Trang chu co it nhat mot san pham that.
- Cac buoc thuc hien:
  1. Truy cap trang chu.
  2. Nhan nut `Them vao gio`.
  3. Nhan icon `Gio hang`.
- Ket qua mong doi:
  1. He thong hien thong bao them gio thanh cong.
  2. Trang gio hang duoc mo.
  3. San pham xuat hien trong gio hang.

### TC_SE_CART_02
- Ma test case: `TC_SE_CART_02`
- Muc tieu kiem thu: Kiem tra tang so luong san pham trong gio hang.
- Dieu kien tien quyet:
  - Gio hang da co it nhat mot san pham.
- Cac buoc thuc hien:
  1. Mo trang gio hang.
  2. Ghi nhan so luong hien tai.
  3. Nhan nut `+`.
- Ket qua mong doi:
  1. So luong san pham tang them 1.
  2. Gia tri hien thi trong gio duoc cap nhat.

### TC_SE_CART_03
- Ma test case: `TC_SE_CART_03`
- Muc tieu kiem thu: Kiem tra giam so luong san pham trong gio hang.
- Dieu kien tien quyet:
  - Gio hang da co san pham.
  - So luong hien tai lon hon hoac bang 2 sau buoc tang.
- Cac buoc thuc hien:
  1. Nhan nut `-` tren dong san pham.
- Ket qua mong doi:
  1. So luong san pham giam 1.
  2. Gia tri don hang duoc cap nhat dung.

### TC_SE_CART_04
- Ma test case: `TC_SE_CART_04`
- Muc tieu kiem thu: Kiem tra xoa san pham khoi gio hang.
- Dieu kien tien quyet:
  - Gio hang da co it nhat mot san pham.
- Cac buoc thuc hien:
  1. Nhan nut `Xoa` tren dong san pham.
- Ket qua mong doi:
  1. San pham bi xoa khoi gio hang.
  2. Neu khong con san pham nao, gio hang hien thi trang thai rong.

## Module Checkout

### TC_SE_CHECKOUT_01
- Ma test case: `TC_SE_CHECKOUT_01`
- Muc tieu kiem thu: Kiem tra dat hang thanh cong voi phuong thuc thanh toan khi nhan hang.
- Dieu kien tien quyet:
  - Nguoi dung da dang nhap.
  - Gio hang co it nhat mot san pham duoc chon.
- Cac buoc thuc hien:
  1. Truy cap gio hang.
  2. Nhan `Thanh toan san pham da chon`.
  3. Tick `Dung thong tin trong tai khoan cua toi`.
  4. Chon `Thanh toan khi nhan hang`.
  5. Nhan `Dat hang`.
- Ket qua mong doi:
  1. He thong dat hang thanh cong.
  2. Dieu huong sang trang `/orders`.
  3. Don hang moi xuat hien trong lich su dat hang.

## Module Orders

### TC_SE_ORDERS_01
- Ma test case: `TC_SE_ORDERS_01`
- Muc tieu kiem thu: Kiem tra hien thi danh sach don hang cua nguoi dung.
- Dieu kien tien quyet:
  - Nguoi dung da dang nhap.
  - Nguoi dung da co it nhat mot don hang.
- Cac buoc thuc hien:
  1. Truy cap trang `/orders`.
- Ket qua mong doi:
  1. Trang lich su don hang hien thi thanh cong.
  2. Hien thi it nhat mot the don hang.

### TC_SE_ORDERS_02
- Ma test case: `TC_SE_ORDERS_02`
- Muc tieu kiem thu: Kiem tra loc don hang theo trang thai.
- Dieu kien tien quyet:
  - Trang don hang da mo thanh cong.
- Cac buoc thuc hien:
  1. Nhan vao mot tab trang thai, vi du `Dang giao`.
- Ket qua mong doi:
  1. Tab vua chon duoc danh dau active.
  2. Danh sach don hang duoc loc theo trang thai tuong ung.

## Module Account

### TC_SE_ACCOUNT_01
- Ma test case: `TC_SE_ACCOUNT_01`
- Muc tieu kiem thu: Kiem tra mo form sua thong tin tai khoan.
- Dieu kien tien quyet:
  - Nguoi dung da dang nhap.
- Cac buoc thuc hien:
  1. Truy cap trang `/account`.
  2. Nhan nut `Sua thong tin`.
- Ket qua mong doi:
  1. Form chinh sua thong tin duoc hien thi.

### TC_SE_ACCOUNT_02
- Ma test case: `TC_SE_ACCOUNT_02`
- Muc tieu kiem thu: Kiem tra dong form sua thong tin tai khoan.
- Dieu kien tien quyet:
  - Form chinh sua dang mo.
- Cac buoc thuc hien:
  1. Nhan nut `Huy`.
- Ket qua mong doi:
  1. Form chinh sua duoc dong.
  2. Trang quay ve che do xem thong tin.

## Module Contact

### TC_SE_CONTACT_01
- Ma test case: `TC_SE_CONTACT_01`
- Muc tieu kiem thu: Kiem tra gui lien he ho tro thanh cong.
- Dieu kien tien quyet:
  - Trang lien he truy cap duoc.
- Cac buoc thuc hien:
  1. Truy cap trang `/contact`.
  2. Nhap ho ten, so dien thoai, email, chu de va noi dung.
  3. Nhan `Gui lien he`.
- Ket qua mong doi:
  1. He thong gui lien he thanh cong.
  2. Hien thi thong bao xac nhan gui thanh cong.

## Module Home Comment

### TC_SE_HOME_COMMENT_01
- Ma test case: `TC_SE_HOME_COMMENT_01`
- Muc tieu kiem thu: Kiem tra gui binh luan tren trang chu.
- Dieu kien tien quyet:
  - Trang chu hien thi form binh luan.
- Cac buoc thuc hien:
  1. Truy cap trang chu.
  2. Nhap noi dung binh luan.
  3. Nhan `Gui binh luan`.
- Ket qua mong doi:
  1. Binh luan moi duoc them vao dau danh sach.
  2. So luong binh luan tang len.

## Module Product Review

### TC_SE_REVIEW_01
- Ma test case: `TC_SE_REVIEW_01`
- Muc tieu kiem thu: Kiem tra gui danh gia san pham thanh cong.
- Dieu kien tien quyet:
  - Co it nhat mot san pham that de mo trang chi tiet.
- Cac buoc thuc hien:
  1. Mo chi tiet san pham.
  2. Nhap noi dung danh gia.
  3. Nhan `Gui danh gia`.
- Ket qua mong doi:
  1. Danh gia moi xuat hien trong danh sach.
  2. So luong phan hoi tang len.

### TC_SE_REVIEW_02
- Ma test case: `TC_SE_REVIEW_02`
- Muc tieu kiem thu: Kiem tra gui binh luan san pham tren trang chi tiet.
- Dieu kien tien quyet:
  - Co it nhat mot san pham that de mo trang chi tiet.
- Cac buoc thuc hien:
  1. Mo chi tiet san pham.
  2. Nhap noi dung binh luan/danh gia.
  3. Nhan `Gui danh gia`.
- Ket qua mong doi:
  1. Noi dung moi hien thi trong khu vuc review.
  2. Bo dem review duoc cap nhat.

## Module Style Chat

### TC_SE_STYLE_CHAT_01
- Ma test case: `TC_SE_STYLE_CHAT_01`
- Muc tieu kiem thu: Kiem tra mo widget AI phoi do.
- Dieu kien tien quyet:
  - Trang chu tai thanh cong.
- Cac buoc thuc hien:
  1. Truy cap trang chu.
  2. Nhan nut `AI phoi do`.
- Ket qua mong doi:
  1. Khung chat duoc mo.
  2. Hien thi loi chao mac dinh cua tro ly.

### TC_SE_STYLE_CHAT_02
- Ma test case: `TC_SE_STYLE_CHAT_02`
- Muc tieu kiem thu: Kiem tra gui cau hoi den AI stylist.
- Dieu kien tien quyet:
  - Widget chat da duoc mo.
- Cac buoc thuc hien:
  1. Nhap mot cau hoi ve phoi do.
  2. Nhan `Gui`.
- Ket qua mong doi:
  1. Tin nhan nguoi dung duoc hien thi trong khung chat.
  2. Tro ly tra ve mot cau tra loi hop le hoac fallback hop le.

## Module Admin Login

### TC_SE_ADMIN_LOGIN_01
- Ma test case: `TC_SE_ADMIN_LOGIN_01`
- Muc tieu kiem thu: Kiem tra admin dang nhap thanh cong vao khu vuc quan tri.
- Dieu kien tien quyet:
  - Tai khoan admin hop le da ton tai trong he thong.
  - Frontend va backend dang chay.
- Cac buoc thuc hien:
  1. Truy cap trang dang nhap.
  2. Nhap email va mat khau admin hop le.
  3. Nhan `Dang nhap`.
- Ket qua mong doi:
  1. He thong dang nhap thanh cong.
  2. Trinh duyet dieu huong sang `/admin`.
  3. Hien thi shell quan tri va menu admin.

## Module Admin Dashboard

### TC_SE_ADMIN_DASHBOARD_01
- Ma test case: `TC_SE_ADMIN_DASHBOARD_01`
- Muc tieu kiem thu: Kiem tra trang dashboard admin hien thi du lieu tong quan.
- Dieu kien tien quyet:
  - Admin da dang nhap thanh cong.
- Cac buoc thuc hien:
  1. Truy cap `/admin`.
- Ket qua mong doi:
  1. Hien thi trang dashboard.
  2. Hien thi cac khoi thong ke tong quan nhu doanh thu, don hang, ton kho hoac khach hang.
  3. Hien thi quick action va danh sach don gan day.

### TC_SE_ADMIN_DASHBOARD_02
- Ma test case: `TC_SE_ADMIN_DASHBOARD_02`
- Muc tieu kiem thu: Kiem tra dieu huong tu dashboard sang cac module quan tri.
- Dieu kien tien quyet:
  - Admin da dang nhap.
  - Dashboard dang hien thi.
- Cac buoc thuc hien:
  1. Nhan mot quick action tren dashboard, vi du `Quan ly don hang` hoac `Quan ly khach hang`.
- Ket qua mong doi:
  1. He thong dieu huong den dung trang admin tuong ung.
  2. Shell admin van duoc giu nguyen.

## Module Admin Overview

### TC_SE_ADMIN_OVERVIEW_01
- Ma test case: `TC_SE_ADMIN_OVERVIEW_01`
- Muc tieu kiem thu: Kiem tra trang tong quan kinh doanh hien thi KPI va bieu do co ban.
- Dieu kien tien quyet:
  - Admin da dang nhap.
- Cac buoc thuc hien:
  1. Truy cap `/admin/overview`.
- Ket qua mong doi:
  1. Trang overview hien thi thanh cong.
  2. Hien thi cac KPI kinh doanh va thong tin tong hop.

## Module Admin Search

### TC_SE_ADMIN_SEARCH_01
- Ma test case: `TC_SE_ADMIN_SEARCH_01`
- Muc tieu kiem thu: Kiem tra o tim kiem trong khu vuc admin hoat dong.
- Dieu kien tien quyet:
  - Admin da dang nhap.
- Cac buoc thuc hien:
  1. Truy cap `/admin/search`.
  2. Nhap tu khoa tim kiem.
- Ket qua mong doi:
  1. He thong tiep nhan tu khoa.
  2. Hien thi ket qua hoac trang thai phu hop voi tu khoa da nhap.

## Module Admin Product Management

### TC_SE_ADMIN_PRODUCT_01
- Ma test case: `TC_SE_ADMIN_PRODUCT_01`
- Muc tieu kiem thu: Kiem tra trang quan ly san pham hien thi danh sach san pham.
- Dieu kien tien quyet:
  - Admin da dang nhap.
- Cac buoc thuc hien:
  1. Truy cap `/admin/products`.
- Ket qua mong doi:
  1. Danh sach san pham hien thi thanh cong.
  2. Hien thi cac thong tin co ban nhu ten, gia, ton kho, danh muc.

### TC_SE_ADMIN_PRODUCT_02
- Ma test case: `TC_SE_ADMIN_PRODUCT_02`
- Muc tieu kiem thu: Kiem tra mo form them moi hoac chinh sua san pham.
- Dieu kien tien quyet:
  - Trang quan ly san pham dang mo.
- Cac buoc thuc hien:
  1. Nhan nut `Them san pham` hoac chon mot san pham de sua.
- Ket qua mong doi:
  1. Drawer hoac form san pham duoc hien thi.
  2. Cac truong thong tin san pham co the nhap lieu/chinh sua.

## Module Admin Order Management

### TC_SE_ADMIN_ORDER_01
- Ma test case: `TC_SE_ADMIN_ORDER_01`
- Muc tieu kiem thu: Kiem tra trang quan ly don hang hien thi danh sach don.
- Dieu kien tien quyet:
  - Admin da dang nhap.
  - He thong co du lieu don hang.
- Cac buoc thuc hien:
  1. Truy cap `/admin/orders`.
- Ket qua mong doi:
  1. Danh sach don hang hien thi thanh cong.
  2. Moi don hien thi duoc thong tin co ban nhu ma don, khach hang, tong tien, trang thai.

### TC_SE_ADMIN_ORDER_02
- Ma test case: `TC_SE_ADMIN_ORDER_02`
- Muc tieu kiem thu: Kiem tra mo chi tiet don hang trong khu vuc admin.
- Dieu kien tien quyet:
  - Trang quan ly don hang da mo.
  - Co it nhat mot don hang trong danh sach.
- Cac buoc thuc hien:
  1. Chon mot don hang trong danh sach.
- Ket qua mong doi:
  1. Drawer chi tiet don hang duoc hien thi.
  2. Hien thi thong tin san pham, dia chi, thanh toan va trang thai don.

### TC_SE_ADMIN_ORDER_03
- Ma test case: `TC_SE_ADMIN_ORDER_03`
- Muc tieu kiem thu: Kiem tra cap nhat trang thai don hang.
- Dieu kien tien quyet:
  - Admin dang mo chi tiet mot don hang.
- Cac buoc thuc hien:
  1. Chon mot trang thai moi hop le.
  2. Luu thay doi.
- Ket qua mong doi:
  1. Trang thai don hang duoc cap nhat thanh cong.
  2. Danh sach/drawer hien thi dung trang thai moi.

## Module Admin User Management

### TC_SE_ADMIN_USER_01
- Ma test case: `TC_SE_ADMIN_USER_01`
- Muc tieu kiem thu: Kiem tra trang quan ly khach hang hien thi danh sach nguoi dung.
- Dieu kien tien quyet:
  - Admin da dang nhap.
- Cac buoc thuc hien:
  1. Truy cap `/admin/users`.
- Ket qua mong doi:
  1. Danh sach nguoi dung hien thi thanh cong.
  2. Hien thi cac thong tin nhu ho ten, email, vai tro, trang thai.

## Module Admin Contact Management

### TC_SE_ADMIN_CONTACT_01
- Ma test case: `TC_SE_ADMIN_CONTACT_01`
- Muc tieu kiem thu: Kiem tra trang quan ly lien he hien thi cac yeu cau ho tro.
- Dieu kien tien quyet:
  - Admin da dang nhap.
  - He thong co du lieu lien he tu khach hang.
- Cac buoc thuc hien:
  1. Truy cap `/admin/contacts`.
- Ket qua mong doi:
  1. Danh sach yeu cau lien he hien thi thanh cong.
  2. Co the xem noi dung hoi thoai hoac trang thai xu ly.

## Module Admin Voucher Management

### TC_SE_ADMIN_VOUCHER_01
- Ma test case: `TC_SE_ADMIN_VOUCHER_01`
- Muc tieu kiem thu: Kiem tra trang quan ly voucher hien thi danh sach voucher.
- Dieu kien tien quyet:
  - Admin da dang nhap.
- Cac buoc thuc hien:
  1. Truy cap `/admin/vouchers`.
- Ket qua mong doi:
  1. Danh sach voucher hien thi thanh cong.
  2. Hien thi duoc ma voucher, gia tri, trang thai va gioi han su dung.

### TC_SE_ADMIN_VOUCHER_02
- Ma test case: `TC_SE_ADMIN_VOUCHER_02`
- Muc tieu kiem thu: Kiem tra mo form tao moi voucher.
- Dieu kien tien quyet:
  - Trang voucher dang mo.
- Cac buoc thuc hien:
  1. Nhan nut `Them voucher` hoac nut tao moi.
- Ket qua mong doi:
  1. Form tao voucher duoc hien thi.
  2. Cac truong ma, ten, gia tri, thoi gian va trang thai co the nhap lieu.

## Module Admin Payment Settings

### TC_SE_ADMIN_PAYMENT_01
- Ma test case: `TC_SE_ADMIN_PAYMENT_01`
- Muc tieu kiem thu: Kiem tra trang cai dat thanh toan hien thi thong tin cau hinh.
- Dieu kien tien quyet:
  - Admin da dang nhap.
- Cac buoc thuc hien:
  1. Truy cap `/admin/payments`.
- Ket qua mong doi:
  1. Trang cai dat thanh toan hien thi thanh cong.
  2. Hien thi duoc thong tin tai khoan, ngan hang, QR hoac cau hinh lien quan.

## Module Admin Report Management

### TC_SE_ADMIN_REPORT_01
- Ma test case: `TC_SE_ADMIN_REPORT_01`
- Muc tieu kiem thu: Kiem tra trang bao cao hien thi KPI va danh sach thong ke.
- Dieu kien tien quyet:
  - Admin da dang nhap.
- Cac buoc thuc hien:
  1. Truy cap `/admin/reports`.
- Ket qua mong doi:
  1. Hien thi cac KPI nhu doanh thu, so don, ty le thanh toan.
  2. Hien thi bieu do/doanh thu theo thang va cac khung thong ke lien quan.

### TC_SE_ADMIN_REPORT_02
- Ma test case: `TC_SE_ADMIN_REPORT_02`
- Muc tieu kiem thu: Kiem tra loc bao cao theo thoi gian.
- Dieu kien tien quyet:
  - Trang bao cao da mo.
- Cac buoc thuc hien:
  1. Chon mot che do loc thoi gian, vi du theo ngay, thang hoac nam.
  2. Chon gia tri loc phu hop.
- Ket qua mong doi:
  1. Du lieu bao cao duoc cap nhat theo pham vi da chon.
  2. KPI va danh sach lien quan duoc lam moi.

## Module Admin Settings

### TC_SE_ADMIN_SETTINGS_01
- Ma test case: `TC_SE_ADMIN_SETTINGS_01`
- Muc tieu kiem thu: Kiem tra trang cai dat cua hang hien thi cac thong tin co the cau hinh.
- Dieu kien tien quyet:
  - Admin da dang nhap.
- Cac buoc thuc hien:
  1. Truy cap `/admin/settings`.
- Ket qua mong doi:
  1. Trang cai dat hien thi thanh cong.
  2. Hien thi duoc cac truong thong tin cua hang va tuy chon cau hinh.

## Module Admin Support Center

### TC_SE_ADMIN_SUPPORT_01
- Ma test case: `TC_SE_ADMIN_SUPPORT_01`
- Muc tieu kiem thu: Kiem tra trung tam ho tro admin hien thi huong dan va thong tin nhanh.
- Dieu kien tien quyet:
  - Admin da dang nhap.
- Cac buoc thuc hien:
  1. Truy cap `/admin/support`.
- Ket qua mong doi:
  1. Hien thi trang trung tam ho tro.
  2. Hien thi thong tin huong dan, thong ke hoac cac ticket noi bat.

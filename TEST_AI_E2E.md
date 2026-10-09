# Test AI bang Cypress va Selenium

Du an hien co san Cypress va da duoc bo sung them Selenium smoke test de ban danh gia giao dien va chat AI theo 2 cach:

- `Cypress`: test UI nhanh, on dinh, mock API de kiem tra luong giao dien.
- `Selenium`: test tren trinh duyet that, goi den he thong dang chay de xem phan hoi AI/fallback thuc te.

## 1. Cai them dependency

```bash
npm install
```

## 2. Chay he thong

Can mo 2 server truoc:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

Mac dinh:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 3. Chay Cypress

Chay toan bo test:

```bash
npm run cypress:run
```

Chay rieng chat AI:

```bash
npm run cypress:run:chat
```

Ca test nay mock `POST /api/style-chat`, nen khong phu thuoc quota cua model.

## 4. Chay Selenium

Chay toan bo Selenium smoke:

```bash
npm run selenium:run
```

Chay rieng login:

```bash
npm run selenium:run:login
```

Chay luong dang ky roi dang nhap lai:

```bash
npm run selenium:run:register-login
```

Chay rieng AI stylist:

```bash
npm run selenium:run:chat
```

Bo Selenium hien tai se:

- mo trang dang nhap va kiem tra luong login/logout
- mo trang dang ky, tao tai khoan moi hop le roi dang nhap lai
- mo trang chu
- mo widget `AI phoi do`
- gui cau hoi
- in cau tra loi ra terminal
- kiem tra o tim kiem van dieu huong duoc

Neu can doi prompt:

```bash
$env:SELENIUM_CHAT_PROMPT="Di hen ho mac gi?"
npm run selenium:run:chat
```

Neu frontend khong o cong `5173`:

```bash
$env:SELENIUM_BASE_URL="http://localhost:4173"
npm run selenium:run
```

Neu muon doi tai khoan smoke test:

```bash
$env:SELENIUM_USER_EMAIL="alice@example.com"
$env:SELENIUM_USER_PASSWORD="Password@123"
npm run selenium:run:login
```

## 5. Cach danh gia mo hinh

Ban co the dung cap test nay theo cach sau:

1. Dung Cypress de chac chan giao dien chat khong vo.
2. Dung Selenium de so sanh cau tra loi giua cac model hoac fallback.
3. Ghi lai:
   - toc do tra loi
   - do dai/noi dung tu van
   - do lien quan voi prompt
   - kha nang fallback khi model loi/quota

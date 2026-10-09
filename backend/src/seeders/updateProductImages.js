const dotenv = require("dotenv");
const { sequelize, Product, Category } = require("../models");

dotenv.config();

const productUpdates = [
  {
    matchName: "Quần Slacks Ống Suông",
    payload: {
      name: "Uniqlo Smart Pants Co Giãn 2 Chiều",
      price: 1190000,
      description:
        "Quần smart pants dáng gọn, chất vải co giãn hai chiều và rất hợp để phối cùng polo cho diện mạo hiện đại, lịch sự.",
      image:
        "https://images.pexels.com/photos/16554926/pexels-photo-16554926.jpeg?cs=srgb&dl=pexels-luciani-kolecha-479657240-16554926.jpg&fm=jpg",
    },
  },
  {
    matchName: "Quần Jean Ống Suông Xanh Nhạt",
    payload: {
      name: "Calvin Klein Jeans Slim Fit Màu Tối",
      price: 1490000,
      description:
        "Jeans slim fit màu tối theo tinh thần tối giản cao cấp, đủ lịch sự để phối với áo polo nhưng vẫn giữ nét trẻ trung hiện đại.",
      image:
        "https://images.pexels.com/photos/11804440/pexels-photo-11804440.jpeg?cs=srgb&dl=pexels-stephen-c-213168251-11804440.jpg&fm=jpg",
    },
  },
  {
    matchName: "Quần Ống Rộng Rủ Soft Fit",
    payload: {
      name: "Zara Quần Ống Rộng High-Waist",
      price: 1090000,
      description:
        "Quần ống rộng cạp cao kéo dáng tốt, hợp phong cách thanh lịch hiện đại và phối rất đẹp với sơ mi, áo kiểu hoặc blazer nhẹ.",
      image:
        "https://images.pexels.com/photos/8951115/pexels-photo-8951115.jpeg?cs=srgb&dl=pexels-nicolle-kreisch-1366888-8951115.jpg&fm=jpg",
    },
  },
  {
    matchName: "Quần Short Cạp Cao Campus",
    payload: {
      name: "Routine Quần Tây Nam Slimfit Hiện Đại",
      price: 950000,
      description:
        "Quần tây slimfit phom hiện đại, tạo tổng thể gọn gàng và nam tính, rất hợp các set polo công sở hoặc smart-casual.",
      image:
        "https://images.pexels.com/photos/30554607/pexels-photo-30554607.jpeg?cs=srgb&dl=pexels-andrea-musto-365224515-30554607.jpg&fm=jpg",
    },
  },
  {
    matchName: "Quần Culottes Soft Office",
    payload: {
      name: "D.CHIC Quần Suông Cạp Cao Tôn Dáng",
      price: 980000,
      description:
        "Quần suông cạp cao thanh lịch, tôn chân và dễ ứng dụng trong môi trường công sở lẫn những dịp cần diện mạo chỉnh chu hơn.",
      image:
        "https://images.pexels.com/photos/19977588/pexels-photo-19977588.jpeg?cs=srgb&dl=pexels-mauricio-casas-454804780-19977588.jpg&fm=jpg",
    },
  },
  {
    matchName: "Quần Jogger Street Mood",
    payload: {
      name: "Coolmate Chinos Smart Pants Vải Tech",
      price: 890000,
      description:
        "Chinos smart pants chất liệu tech nhẹ, giữ phom tốt và cân bằng giữa vẻ trẻ trung với sự gọn gàng cần có cho phong cách hiện đại.",
      image:
        "https://images.pexels.com/photos/9488409/pexels-photo-9488409.jpeg?cs=srgb&dl=pexels-cottonbro-9488409.jpg&fm=jpg",
    },
  },
  {
    matchName: "Gentle Monster Lilit 01",
    payload: {
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=90",
    },
  },
  {
    matchName: "Bolon Gọng Kính Mắt Mèo Thanh Lịch",
    payload: {
      image: "https://images.pexels.com/photos/29538709/pexels-photo-29538709.jpeg?cs=srgb&dl=pexels-amar-29538709.jpg&fm=jpg",
    },
  },
  {
    matchName: "Prada Symbole Sunglasses",
    payload: {
      image:
        "https://images.pexels.com/photos/26762547/pexels-photo-26762547.jpeg?cs=srgb&dl=pexels-glassesshop-gs-1317359316-26762547.jpg&fm=jpg",
    },
  },
  {
    matchName: "Ray-Ban Aviator Classic",
    payload: {
      image:
        "https://images.pexels.com/photos/29332838/pexels-photo-29332838.jpeg?cs=srgb&dl=pexels-ahcapture-29332838.jpg&fm=jpg",
    },
  },
  {
    matchName: "Owndays Graph Belle",
    payload: {
      image: "https://images.pexels.com/photos/1438409/pexels-photo-1438409.jpeg?cs=srgb&dl=pexels-martabranco-1438409.jpg&fm=jpg",
    },
  },
  {
    matchName: "Oakley Holbrook",
    payload: {
      image: "https://images.pexels.com/photos/2371897/pexels-photo-2371897.jpeg?cs=srgb&dl=pexels-athena-2371897.jpg&fm=jpg",
    },
  },
  {
    matchName: "Vigcom Gọng Kính Cận Acetate Cao Cấp",
    payload: {
      image:
        "https://images.pexels.com/photos/18279387/pexels-photo-18279387.jpeg?cs=srgb&dl=pexels-joecreativestudio-18279387.jpg&fm=jpg",
    },
  },
  {
    matchName: "Xiaomi Kính Chống Ánh Sáng Xanh Mijia",
    payload: {
      image:
        "https://images.pexels.com/photos/28065039/pexels-photo-28065039.jpeg?cs=srgb&dl=pexels-glassesshop-gs-1317359316-28065039.jpg&fm=jpg",
    },
  },
  {
    matchName: "Túi Tote Campus Basic",
    payload: {
      image: "https://images.pexels.com/photos/9869067/pexels-photo-9869067.jpeg?cs=srgb&dl=pexels-brando-ltd-1362849-9869067.jpg&fm=jpg",
    },
  },
  {
    matchName: "Card Holder Shoulder Mini",
    payload: {
      image: "https://images.pexels.com/photos/29234427/pexels-photo-29234427.jpeg?cs=srgb&dl=pexels-ali-pli-1519223672-29234427.jpg&fm=jpg",
    },
  },
  {
    matchName: "Túi Hobo Mềm Daily Seoul",
    payload: {
      image: "https://images.pexels.com/photos/10471381/pexels-photo-10471381.jpeg?cs=srgb&dl=pexels-sam-lion-10471381.jpg&fm=jpg",
    },
  },
  {
    matchName: "Túi Crossbody Clean Pocket",
    payload: {
      image: "https://images.pexels.com/photos/27127623/pexels-photo-27127623.jpeg?cs=srgb&dl=pexels-aleksandar-andreev-3061085-27127623.jpg&fm=jpg",
    },
  },
  {
    matchName: "Túi Clutch Satin Date Night",
    payload: {
      image: "https://images.pexels.com/photos/8311883/pexels-photo-8311883.jpeg?cs=srgb&dl=pexels-ron-lach-8311883.jpg&fm=jpg",
    },
  },
  {
    matchName: "Túi Bucket Mini Soft Girl",
    payload: {
      image: "https://images.pexels.com/photos/9736984/pexels-photo-9736984.jpeg?cs=srgb&dl=pexels-kubra-celik-104684393-9736984.jpg&fm=jpg",
    },
  },
  {
    matchName: "Chân Váy Tennis Basic",
    payload: {
      name: "IVY moda Chân Váy Chữ A Đính Cúc Sang Trọng",
      price: 840000,
      description:
        "Chân váy chữ A điểm cúc tinh tế, dễ phối với áo polo hoặc sơ mi để tạo vẻ ngoài thanh lịch và hiện đại.",
      image: "https://images.pexels.com/photos/19363298/pexels-photo-19363298.jpeg?cs=srgb&dl=pexels-hans-gajjar-69693644-19363298.jpg&fm=jpg",
    },
  },
  {
    matchName: "Váy Midi Satin Layered",
    payload: {
      name: "Rechic Chân Váy Lụa Satin Bóng Mịn",
      price: 920000,
      description:
        "Chân váy lụa satin bóng mịn, rủ đẹp và rất hợp cho các bản phối nữ tính, sang nhẹ cùng phụ kiện tinh gọn.",
      image: "https://images.pexels.com/photos/16976797/pexels-photo-16976797.jpeg?cs=srgb&dl=pexels-nguyendesigner-16976797.jpg&fm=jpg",
    },
  },
  {
    matchName: "Váy Denim Chữ A High Waist",
    payload: {
      name: "Levis Chân Váy Jean Decon Iconic",
      price: 980000,
      description:
        "Chân váy jean mang tinh thần casual cao cấp, dễ phối với polo, áo thun hoặc blazer để tạo tổng thể năng động mà vẫn gọn đẹp.",
      image: "https://images.pexels.com/photos/17506564/pexels-photo-17506564.jpeg?cs=srgb&dl=pexels-jonaorle-17506564.jpg&fm=jpg",
    },
  },
  {
    matchName: "Váy Bút Chì Minimal Hàn",
    payload: {
      name: "D.CHIC Chân Váy Bút Chì Xẻ Trước Tinh Tế",
      price: 860000,
      description:
        "Chân váy bút chì xẻ trước thanh lịch, tôn dáng và phù hợp môi trường công sở hoặc những dịp cần vẻ ngoài chỉn chu hơn.",
      image: "https://images.pexels.com/photos/17822244/pexels-photo-17822244.jpeg?cs=srgb&dl=pexels-gisele-seidel-170981851-17822244.jpg&fm=jpg",
    },
  },
  {
    matchName: "Váy Tennis Pleated Seoul",
    payload: {
      name: "Uniqlo Chân Váy Xếp Ly Dáng Dài",
      price: 790000,
      description:
        "Chân váy xếp ly dáng dài mềm rủ, phù hợp với phong cách tối giản hiện đại và dễ phối cùng áo polo hoặc áo len mỏng.",
      image: "https://images.pexels.com/photos/17371754/pexels-photo-17371754.jpeg?cs=srgb&dl=pexels-conejodepapel-17371754.jpg&fm=jpg",
    },
  },
  {
    matchName: "IVY moda Chân Váy Chữ A Đính Cúc Sang Trọng",
    payload: {
      image: "https://images.pexels.com/photos/19363298/pexels-photo-19363298.jpeg?cs=srgb&dl=pexels-hans-gajjar-69693644-19363298.jpg&fm=jpg",
    },
  },
  {
    matchName: "Rechic Chân Váy Lụa Satin Bóng Mịn",
    payload: {
      image: "https://images.pexels.com/photos/16976797/pexels-photo-16976797.jpeg?cs=srgb&dl=pexels-nguyendesigner-16976797.jpg&fm=jpg",
    },
  },
  {
    matchName: "Levis Chân Váy Jean Decon Iconic",
    payload: {
      image: "https://images.pexels.com/photos/17506564/pexels-photo-17506564.jpeg?cs=srgb&dl=pexels-jonaorle-17506564.jpg&fm=jpg",
    },
  },
  {
    matchName: "D.CHIC Chân Váy Bút Chì Xẻ Trước Tinh Tế",
    payload: {
      image: "https://images.pexels.com/photos/17822244/pexels-photo-17822244.jpeg?cs=srgb&dl=pexels-gisele-seidel-170981851-17822244.jpg&fm=jpg",
    },
  },
  {
    matchName: "Uniqlo Chân Váy Xếp Ly Dáng Dài",
    payload: {
      image: "https://images.pexels.com/photos/17371754/pexels-photo-17371754.jpeg?cs=srgb&dl=pexels-conejodepapel-17371754.jpg&fm=jpg",
    },
  },
];

const productsToCreate = [
  {
    name: "Aristino Quần Âu Kaki Cao Cấp Công Sở",
    price: 1290000,
    description:
      "Quần âu kaki cao cấp với bề mặt gọn đẹp, phù hợp môi trường công sở hiện đại và phối rất ổn cùng polo trơn hoặc áo sơ mi.",
    image:
      "https://images.pexels.com/photos/2220315/pexels-photo-2220315.jpeg?cs=srgb&dl=pexels-huy-phan-316220-2220315.jpg&fm=jpg",
    stock: 17,
    categoryName: "Quần",
  },
  {
    name: "Biluxury Quần Vải Nam Dáng Đứng Sang Trọng",
    price: 1150000,
    description:
      "Quần vải nam dáng đứng tạo tổng thể lịch lãm và chững chạc, hợp các set đồ business-casual hoặc đi sự kiện nhẹ.",
    image:
      "https://images.pexels.com/photos/5325887/pexels-photo-5325887.jpeg?cs=srgb&dl=pexels-cottonbro-5325887.jpg&fm=jpg",
    stock: 19,
    categoryName: "Quần",
  },
  {
    name: "Adam Store Quần Âu May Đo Cao Cấp",
    price: 1390000,
    description:
      "Quần âu phom may đo cao cấp, đường nét chỉn chu và cực hợp với áo polo tối màu để tạo vẻ nam tính hiện đại.",
    image:
      "https://images.pexels.com/photos/7691082/pexels-photo-7691082.jpeg?cs=srgb&dl=pexels-mikhail-nilov-7691082.jpg&fm=jpg",
    stock: 14,
    categoryName: "Quần",
  },
  {
    name: "IVY moda Quần Baggy Nữ Công Sở",
    price: 990000,
    description:
      "Quần baggy nữ công sở cân bằng giữa sự thanh lịch và thoải mái, dễ phối blazer, áo kiểu hoặc knitwear mỏng.",
    image:
      "https://images.pexels.com/photos/19910071/pexels-photo-19910071.jpeg?cs=srgb&dl=pexels-azad-washim-1174030-19910071.jpg&fm=jpg",
    stock: 20,
    categoryName: "Quần",
  },
  {
    name: "Mango Quần Tây Ống Đứng Straight-Cut",
    price: 1120000,
    description:
      "Quần tây ống đứng mang tinh thần tối giản châu Âu, hợp phong cách công sở thanh lịch và những set đồ cần vẻ sang nhẹ.",
    image:
      "https://images.pexels.com/photos/6765028/pexels-photo-6765028.jpeg?cs=srgb&dl=pexels-mart-production-6765028.jpg&fm=jpg",
    stock: 16,
    categoryName: "Quần",
  },
  {
    name: "Gumac Quần Tây Nữ Ống Loe Nhẹ Hiện Đại",
    price: 930000,
    description:
      "Quần tây nữ ống loe nhẹ giúp kéo chân và tạo cảm giác mềm mại, phù hợp với giày cao gót hoặc sandal thanh mảnh.",
    image:
      "https://images.pexels.com/photos/5710082/pexels-photo-5710082.jpeg?cs=srgb&dl=pexels-thirdman-5710082.jpg&fm=jpg",
    stock: 18,
    categoryName: "Quần",
  },
  {
    name: "Levis Quần Chinos XX Standard",
    price: 1190000,
    description:
      "Chinos chuẩn phom với vẻ ngoài sạch sẽ, linh hoạt cho cả đi làm lẫn đi chơi và rất dễ phối cùng polo basic.",
    image:
      "https://images.pexels.com/photos/6311650/pexels-photo-6311650.jpeg?cs=srgb&dl=pexels-julio-lopez-1840139-6311650.jpg&fm=jpg",
    stock: 21,
    categoryName: "Quần",
  },
  {
    name: "Libe Quần Jean Nữ Ống Suông Màu Cream",
    price: 980000,
    description:
      "Jeans nữ ống suông màu cream cho cảm giác sáng, hiện đại và rất hợp với các bản phối tối giản theo hướng cao cấp.",
    image:
      "https://images.pexels.com/photos/9558761/pexels-photo-9558761.jpeg?cs=srgb&dl=pexels-kseniachernaya-9558761.jpg&fm=jpg",
    stock: 15,
    categoryName: "Quần",
  },
  {
    name: "Charles & Keith Túi Đeo Chéo Nắp Gập Khóa Kim Loại",
    price: 1290000,
    description:
      "Túi đeo chéo nắp gập với khóa kim loại sắc nét, hợp những outfit thanh lịch, hiện đại và dễ dùng từ đi làm đến tiệc tối nhẹ.",
    image:
      "https://images.pexels.com/photos/29234427/pexels-photo-29234427.jpeg?cs=srgb&dl=pexels-ali-pli-1519223672-29234427.jpg&fm=jpg",
    stock: 18,
    categoryName: "Túi Xách",
  },
  {
    name: "Pedro Studio Leather Túi Xách Tay Da Thật",
    price: 2190000,
    description:
      "Túi xách tay da thật phom studio gọn đẹp, sang trọng và phù hợp cho những dịp cần vẻ ngoài chỉn chu, cao cấp.",
    image:
      "https://images.pexels.com/photos/4452707/pexels-photo-4452707.jpeg?cs=srgb&dl=pexels-vlada-karpovich-4452707.jpg&fm=jpg",
    stock: 14,
    categoryName: "Túi Xách",
  },
  {
    name: "Vascara Clutch Dự Tiệc Đính Đá",
    price: 1490000,
    description:
      "Clutch dự tiệc đính đá bắt sáng, đủ nổi bật cho váy tiệc nhưng vẫn giữ được tổng thể tinh tế và sang mắt.",
    image:
      "https://images.pexels.com/photos/8311883/pexels-photo-8311883.jpeg?cs=srgb&dl=pexels-ron-lach-8311883.jpg&fm=jpg",
    stock: 16,
    categoryName: "Túi Xách",
  },
  {
    name: "Aldo Túi Xách Tay Dáng Hộp Thời Thượng",
    price: 1590000,
    description:
      "Túi dáng hộp đường nét hiện đại, hợp phong cách thành thị và dễ tạo điểm nhấn cho các bản phối tối giản.",
    image:
      "https://images.pexels.com/photos/5761407/pexels-photo-5761407.jpeg?cs=srgb&dl=pexels-natalie-birdy-5732999-5761407.jpg&fm=jpg",
    stock: 15,
    categoryName: "Túi Xách",
  },
  {
    name: "Floralpunk Túi Kẹp Nách Đính Ngọc Trai",
    price: 980000,
    description:
      "Túi kẹp nách đính ngọc trai nhân tạo mang cảm giác nữ tính và thời trang, hợp đi tiệc nhẹ hoặc hẹn hò buổi tối.",
    image:
      "https://images.pexels.com/photos/5761407/pexels-photo-5761407.jpeg?cs=srgb&dl=pexels-natalie-birdy-5732999-5761407.jpg&fm=jpg",
    stock: 17,
    categoryName: "Túi Xách",
  },
  {
    name: "Juno Túi Xách Tay Cỡ Vừa Phối Màu Hiện Đại",
    price: 1120000,
    description:
      "Túi xách tay cỡ vừa phối màu hiện đại, phù hợp nhịp đi làm hằng ngày và giữ được vẻ thanh lịch, trẻ trung.",
    image:
      "https://images.pexels.com/photos/4452707/pexels-photo-4452707.jpeg?cs=srgb&dl=pexels-vlada-karpovich-4452707.jpg&fm=jpg",
    stock: 22,
    categoryName: "Túi Xách",
  },
  {
    name: "Sabina Túi Tote Da Mềm Dáng Lớn",
    price: 1390000,
    description:
      "Tote da mềm dáng lớn tiện cho đi làm hoặc di chuyển cả ngày, giữ vẻ tối giản nhưng vẫn đủ sang và chuyên nghiệp.",
    image:
      "https://images.pexels.com/photos/3607627/pexels-photo-3607627.jpeg?cs=srgb&dl=pexels-deeana-arts-1646953-3607627.jpg&fm=jpg",
    stock: 19,
    categoryName: "Túi Xách",
  },
  {
    name: "NEM Fashion Túi Da Vân Nổi Công Sở",
    price: 1250000,
    description:
      "Túi da vân nổi công sở với phom thanh lịch, dễ phối cùng trang phục đi làm và tạo cảm giác gọn gàng, chỉn chu.",
    image:
      "https://images.pexels.com/photos/1214212/pexels-photo-1214212.jpeg?cs=srgb&dl=pexels-stephanie-ho-994173-1214212.jpg&fm=jpg",
    stock: 18,
    categoryName: "Túi Xách",
  },
  {
    name: "Coolmate Túi Canvas Đa Năng",
    price: 790000,
    description:
      "Túi canvas đa năng cho đi làm hoặc đi chơi, gọn nhẹ, hiện đại và hợp phong cách tối giản của nam giới trẻ.",
    image:
      "https://images.pexels.com/photos/9869067/pexels-photo-9869067.jpeg?cs=srgb&dl=pexels-brando-ltd-1362849-9869067.jpg&fm=jpg",
    stock: 24,
    categoryName: "Túi Xách",
  },
  {
    name: "Leonardo Cặp Da Công Sở Đựng Laptop",
    price: 1890000,
    description:
      "Cặp da công sở đựng laptop với thiết kế gọn gàng, chuyên nghiệp và phù hợp cho môi trường làm việc hiện đại.",
    image:
      "https://images.pexels.com/photos/35633111/pexels-photo-35633111.jpeg?cs=srgb&dl=pexels-krix-gallery-31027886-35633111.jpg&fm=jpg",
    stock: 13,
    categoryName: "Túi Xách",
  },
  {
    name: "Lather World Briefcase Da Thật Cao Cấp",
    price: 2290000,
    description:
      "Briefcase da thật cao cấp với vẻ ngoài lịch lãm, phù hợp doanh nhân hoặc những set đồ công sở cần điểm nhấn sang trọng.",
    image:
      "https://images.pexels.com/photos/19615885/pexels-photo-19615885.jpeg?cs=srgb&dl=pexels-ronaldo-guiraldelli-177271645-19615885.jpg&fm=jpg",
    stock: 11,
    categoryName: "Túi Xách",
  },
  {
    name: "Gence Túi Clutch Nam Cầm Tay Sang Trọng",
    price: 990000,
    description:
      "Clutch nam cầm tay thiết kế tối giản nhưng sang trọng, phù hợp cho gặp gỡ đối tác, tiệc tối hoặc sự kiện nhẹ.",
    image:
      "https://images.pexels.com/photos/27127623/pexels-photo-27127623.jpeg?cs=srgb&dl=pexels-aleksandar-andreev-3061085-27127623.jpg&fm=jpg",
    stock: 16,
    categoryName: "Túi Xách",
  },
  {
    name: "Gumac Chân Váy Bút Chì Phối Đai Thanh Lịch",
    price: 890000,
    description:
      "Chân váy bút chì phối đai gọn đẹp, tạo điểm nhấn tinh tế và phù hợp cho phong cách công sở hiện đại.",
    image:
      "https://images.pexels.com/photos/6368570/pexels-photo-6368570.jpeg?cs=srgb&dl=pexels-cottonbro-6368570.jpg&fm=jpg",
    stock: 18,
    categoryName: "Váy",
  },
  {
    name: "NEM Fashion Chân Váy Dạ Tweed Phối Viền Tiểu Thư",
    price: 990000,
    description:
      "Chân váy dạ tweed phối viền mang cảm giác tiểu thư hiện đại, hợp phối cùng cardigan, blazer hoặc áo polo trơn.",
    image:
      "https://images.pexels.com/photos/16205546/pexels-photo-16205546.jpeg?cs=srgb&dl=pexels-serdi-16205546.jpg&fm=jpg",
    stock: 15,
    categoryName: "Váy",
  },
  {
    name: "Zara Chân Váy Midi Xếp Ly Ánh Kim",
    price: 1090000,
    description:
      "Chân váy midi xếp ly ánh kim tạo hiệu ứng chuyển động đẹp, phù hợp các bản phối nữ tính và thanh lịch hơn thường ngày.",
    image:
      "https://images.pexels.com/photos/19371808/pexels-photo-19371808.jpeg?cs=srgb&dl=pexels-felix-young-69694809-19371808.jpg&fm=jpg",
    stock: 14,
    categoryName: "Váy",
  },
  {
    name: "Canifa Chân Váy Khaki Dáng Chữ A Cơ Bản",
    price: 760000,
    description:
      "Chân váy khaki dáng chữ A cơ bản, dễ mặc, dễ phối và hợp với nhịp sử dụng hằng ngày theo hướng gọn gàng, hiện đại.",
    image:
      "https://images.pexels.com/photos/7083444/pexels-photo-7083444.jpeg?cs=srgb&dl=pexels-andri-deni-mustopa-34160956-7083444.jpg&fm=jpg",
    stock: 19,
    categoryName: "Váy",
  },
  {
    name: "Twenty.five Chân Váy Jean Xẻ Tà Giữa Cá Tính",
    price: 930000,
    description:
      "Chân váy jean xẻ tà giữa tạo vẻ cá tính và hiện đại, hợp những set đồ street-chic nhưng vẫn giữ được sự nữ tính.",
    image:
      "https://images.pexels.com/photos/17794429/pexels-photo-17794429.jpeg?cs=srgb&dl=pexels-paul-uchechukwu-12390855-17794429.jpg&fm=jpg",
    stock: 17,
    categoryName: "Váy",
  },
];

const updateProducts = async () => {
  let updatedCount = 0;
  let createdCount = 0;

  for (const { matchName, payload } of productUpdates) {
    const [count] = await Product.update(payload, { where: { name: matchName } });
    updatedCount += count;
  }

  for (const product of productsToCreate) {
    const category = await Category.findOne({ where: { name: product.categoryName } });

    if (!category) {
      continue;
    }

    const payload = {
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      stock: product.stock,
      category_id: category.id,
    };
    const exists = await Product.findOne({ where: { name: product.name, category_id: category.id } });

    if (exists) {
      await exists.update(payload);
      updatedCount += 1;
      continue;
    }

    await Product.create(payload);
    createdCount += 1;
  }

  console.log(`Updated ${updatedCount} product record(s).`);
  console.log(`Created ${createdCount} product record(s).`);
};

updateProducts()
  .catch((error) => {
    console.error("Failed to update products:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });

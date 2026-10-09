const ApiError = require("../utils/ApiError");

const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const fallbackCatalog = {
  tops: [
    "áo thun trơn form regular",
    "polo tối giản màu trung tính",
    "sơ mi oxford trắng",
    "sơ mi linen be",
    "cardigan mỏng màu kem",
    "áo khoác denim xanh nhạt",
    "blazer dáng relaxed",
  ],
  bottoms: [
    "quần jeans ống suông",
    "quần tây ống đứng",
    "quần chinos màu be",
    "quần suông cạp cao",
    "chân váy chữ A",
    "chân váy midi",
  ],
  shoes: [
    "sneaker trắng",
    "loafer da đen",
    "giày búp bê basic",
    "ankle boots tối giản",
    "sandal quai mảnh",
  ],
  accessories: [
    "đồng hồ mặt nhỏ",
    "túi đeo vai mini",
    "túi tote da mềm",
    "thắt lưng da bản nhỏ",
    "khuyên tai tối giản",
  ],
  palettes: {
    neutral: "trắng, kem, be, nâu, đen, xám",
    warm: "kem, caramel, nâu đất, đỏ rượu, olive",
    cool: "trắng, xám lạnh, xanh navy, xanh denim, đen",
  },
};

const pickList = (items, count = 3) => items.slice(0, count).join(", ");

const composeOutfit = ({ lead, bottom, shoes, extra }) =>
  `Bạn có thể thử ${lead} phối cùng ${bottom}, đi với ${shoes}${extra ? ` và thêm ${extra}` : ""}.`;

const fallbackAnswer = (message, history = []) => {
  const text = String(message || "").toLowerCase();
  const historyText = Array.isArray(history)
    ? history.map((item) => String(item?.content || "").toLowerCase()).join(" ")
    : "";
  const fullText = `${historyText} ${text}`.trim();

  if (fullText.includes("đám cưới") || fullText.includes("dam cuoi") || fullText.includes("tiệc")) {
    return `Đi tiệc hoặc đám cưới nên ưu tiên vẻ ngoài gọn và có điểm nhấn. Nam có thể mặc sơ mi sáng màu, quần tây ống đứng và loafer da; nếu muốn sang hơn thì thêm blazer relaxed. Nữ có thể chọn váy midi, đầm trơn có độ rủ hoặc áo kiểu phối chân váy chữ A, đi cùng sandal quai mảnh và túi nhỏ. Bảng màu dễ đẹp là ${fallbackCatalog.palettes.warm}.`;
  }

  if (fullText.includes("đi làm") || fullText.includes("cong so") || fullText.includes("công sở")) {
    return `Đi làm bạn nên ưu tiên outfit gọn và sạch. ${composeOutfit({
      lead: "polo tối giản hoặc sơ mi trơn",
      bottom: "quần tây hoặc quần chinos màu be/xám",
      shoes: "loafer hoặc sneaker trắng tối giản",
      extra: "đồng hồ mặt nhỏ",
    })} Nếu là nữ, có thể đổi sang áo kiểu hoặc sơ mi mềm với quần suông hay chân váy midi. Bảng màu an toàn là ${fallbackCatalog.palettes.neutral}.`;
  }

  if (fullText.includes("đi học") || fullText.includes("di hoc")) {
    return `${composeOutfit({
      lead: "áo thun trơn hoặc sơ mi oversize",
      bottom: "quần jeans ống suông",
      shoes: "sneaker trắng",
      extra: "cardigan mỏng hoặc áo khoác denim",
    })} Đây là công thức dễ mặc, trẻ và hợp đi học. Nếu thích style Hàn hơn, bạn có thể dùng tông ${fallbackCatalog.palettes.cool}.`;
  }

  if (fullText.includes("date") || fullText.includes("hẹn hò") || fullText.includes("hen ho")) {
    return `Đi hẹn hò nên ưu tiên outfit sạch, vừa người và có một điểm nhấn. Nam có thể mặc sơ mi linen với quần tây relaxed và loafer. Nữ có thể chọn váy midi, cardigan mỏng hoặc áo kiểu phối chân váy chữ A. Phụ kiện nên nhẹ như ${pickList(fallbackCatalog.accessories, 2)} để tổng thể có chủ đích hơn.`;
  }

  if (fullText.includes("hot") || fullText.includes("trend") || fullText.includes("xu hướng")) {
    return "Một vài phong cách đang dễ mặc: minimal clean fit, old money nhẹ, denim-on-denim, áo polo phối quần suông, sporty preppy, và layer sơ mi khoác ngoài áo thun. Nếu muốn bắt đầu an toàn, hãy chọn một trong ba công thức: áo trơn + quần suông + sneaker trắng; sơ mi linen + quần chinos + loafer; cardigan mỏng + chân váy midi + túi nhỏ.";
  }

  if (fullText.includes("màu") || fullText.includes("mau")) {
    return `Nếu chưa chắc nên phối màu gì, bạn có thể bắt đầu bằng 1 màu nổi và 2 màu trung tính. Công thức dễ mặc là ${fallbackCatalog.palettes.neutral}, hoặc denim - trắng - nâu. Nếu da sáng vừa đến ngăm nhẹ, navy, xanh rêu, nâu chocolate và kem thường rất dễ lên đồ. Nếu muốn mình có thể gợi ý luôn bảng màu theo da sáng, trung bình hoặc ngăm.`;
  }

  if (fullText.includes("mập") || fullText.includes("tròn") || fullText.includes("béo") || fullText.includes("to người")) {
    return "Nếu dáng người đầy hơn, bạn nên ưu tiên đồ đứng phom nhưng không quá bó. Áo cổ tim nhẹ, sơ mi rủ vừa, quần ống đứng hoặc suông, váy midi chữ A và màu trung tính sẽ giúp tổng thể gọn hơn. Tránh chất quá bóng hoặc quá ôm ở đúng vùng bạn chưa tự tin.";
  }

  if (fullText.includes("gầy") || fullText.includes("mảnh") || fullText.includes("thon")) {
    return "Nếu dáng người mảnh, bạn có thể tận dụng layer để outfit đầy đặn hơn. Hãy thử áo thun + sơ mi khoác ngoài, cardigan mỏng, quần ống suông hoặc váy có độ xòe nhẹ. Chất liệu như denim mềm, knit mỏng và cotton dày vừa sẽ giúp lên form đẹp hơn.";
  }

  if (fullText.includes("du lịch") || fullText.includes("di bien") || fullText.includes("đi biển")) {
    return "Đi du lịch hoặc đi biển nên ưu tiên đồ thoáng, nhẹ và dễ phối. Nam có thể mặc áo sơ mi linen khoác ngoài áo thun cùng quần short/chinos nhẹ. Nữ có thể chọn đầm suông, chân váy midi hoặc áo hai dây khoác sơ mi mỏng. Màu hợp bối cảnh này là trắng, be, xanh trời, vàng nhạt và nâu cát.";
  }

  if (fullText.includes("nam")) {
    return `Cho nam, công thức an toàn mà đẹp là áo trơn vừa người + quần suông hoặc slim straight + giày sạch màu trung tính. Bạn có thể xoay quanh các món như ${pickList(fallbackCatalog.tops, 3)}, ${pickList(fallbackCatalog.bottoms, 3)} và ${pickList(fallbackCatalog.shoes, 2)}. Nếu muốn mình có thể tách riêng style công sở, đi chơi hoặc kiểu Hàn.`;
  }

  if (fullText.includes("nữ") || fullText.includes("nu")) {
    return `Cho nữ, bạn có thể bắt đầu từ một món chủ đạo như váy midi, chân váy chữ A hoặc quần suông cạp cao, rồi phối cùng áo ôm nhẹ hoặc sơ mi mềm. Những món fallback dễ phối là ${pickList(fallbackCatalog.bottoms.slice(3), 3)} đi với ${pickList(fallbackCatalog.tops.slice(1, 5), 3)}. Nguyên tắc dễ đẹp là giữ 1 món ôm và 1 món thoáng để tổng thể cân bằng.`;
  }

  return `Bạn cho mình biết thêm dịp mặc, giới tính/phom dáng, màu bạn thích và món đồ đang có nhé. Gợi ý nhanh: chọn 1 món làm điểm nhấn, còn lại giữ trung tính; ưu tiên vừa người, giày sạch, và phụ kiện nhỏ như đồng hồ/túi để outfit có chủ đích hơn. Nếu cần mặc ngay, bạn có thể bắt đầu từ ${pickList(fallbackCatalog.tops, 2)} + ${pickList(fallbackCatalog.bottoms, 2)} + ${pickList(fallbackCatalog.shoes, 1)}.`;
};

const buildPrompt = (message, history = []) => {
  const recentHistory = Array.isArray(history)
    ? history
        .slice(-8)
        .filter((item) => ["user", "assistant"].includes(item.role) && item.content)
        .map((item) => `${item.role === "user" ? "Khách" : "Stylist"}: ${String(item.content).slice(0, 600)}`)
        .join("\n")
    : "";

  return [
    "Bạn là stylist AI cho shop thời trang Dolia.",
    "Trả lời bằng tiếng Việt, thân thiện, thực tế, không quá dài.",
    "Tư vấn phối đồ, màu sắc, phong cách đang hot, chọn size/phom dáng ở mức gợi ý chung.",
    "Nếu thiếu thông tin, hỏi thêm 1 câu ngắn rồi vẫn đưa ra một gợi ý mặc được ngay.",
    "Không bịa rằng shop chắc chắn có một sản phẩm cụ thể nếu không được cung cấp dữ liệu sản phẩm.",
    recentHistory ? `Lịch sử chat gần đây:\n${recentHistory}` : "",
    `Câu hỏi hiện tại: ${String(message).slice(0, 1200)}`,
  ].filter(Boolean).join("\n\n");
};

const askStyleAssistant = async ({ message, history }) => {
  const userMessage = String(message || "").trim();

  if (!userMessage) {
    throw new ApiError(400, "Vui lòng nhập câu hỏi thời trang");
  }

  if (!process.env.GEMINI_API_KEY) {
    return {
      answer: fallbackAnswer(userMessage, history),
      source: "fallback",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: buildPrompt(userMessage, history) }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        answer: fallbackAnswer(userMessage, history),
        source: "fallback",
        warning: data.error?.message || "AI đang quá tải, đã chuyển sang stylist nội bộ.",
      };
    }

    return {
      answer:
        data.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join("\n") ||
        fallbackAnswer(userMessage, history),
      source: "gemini",
    };
  } catch (error) {
    return {
      answer: fallbackAnswer(userMessage, history),
      source: "fallback",
      warning: error.name === "AbortError" ? "AI phản hồi chậm, đã chuyển sang stylist nội bộ." : undefined,
    };
  }
};

module.exports = {
  askStyleAssistant,
};

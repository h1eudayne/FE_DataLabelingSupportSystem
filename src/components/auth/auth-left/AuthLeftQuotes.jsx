import { Carousel } from "react-bootstrap";

const AuthLeftQuotes = ({ isMobile }) => {
  const quotes = [
    { text: "Great things never come from comfort zones.", author: "Admin" },
    {
      text: "Experience is the simply name we give our mistakes.",
      author: "Oscar Wilde",
    },
    {
      text: "The future is still so much bigger than the past.",
      author: "Tim Berners-Lee",
    },
  ];

  return (
    <div className="w-100 quotes-carousel-container">
      <Carousel
        indicators={true}
        controls={false}
        interval={3000}
        fade={true}
        pause={false}
        className="text-start"
      >
        {quotes.map((quote, index) => (
          <Carousel.Item key={index} className="text-white">
            <div style={{ minHeight: isMobile ? "80px" : "110px" }}>
              {" "}
              <p
                className="fw-medium mb-1"
                style={{
                  fontSize: isMobile ? "1.15rem" : "1.4rem",
                  lineHeight: "1.4",
                  color: "white",
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  letterSpacing: "0.2px",
                }}
              >
                "{quote.text}"
              </p>
              <span
                className="text-white-50 d-block mt-2"
                style={{
                  fontSize: "13px",
                  fontWeight: "300",
                  color: "white",
                }}
              >
                — {quote.author}
              </span>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* CSS đè để tùy chỉnh thanh Indicators (thanh gạch dưới) */}
      <style>{`
        .quotes-carousel-container .carousel-indicators {
          margin-bottom: -15px; /* Đẩy thanh gạch xuống dưới chữ một chút */
          justify-content: flex-start; /* Căn lề trái giống tiêu đề */
          margin-left: 0;
        }
        .quotes-carousel-container .carousel-indicators [data-bs-target] {
          width: 20px;
          height: 3px;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AuthLeftQuotes;

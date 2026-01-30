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
        touch={true}
      >
        {quotes.map((quote, index) => (
          <Carousel.Item key={index} className="text-white">
            <div
              style={{
                minHeight: isMobile ? "80px" : "100px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p
                className="fw-medium mb-1"
                style={{
                  fontSize: isMobile ? "1rem" : "1.2rem",
                  lineHeight: "1.4",
                  color: "#ffffff",
                  textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  fontStyle: "italic",
                }}
              >
                "{quote.text}"
              </p>
              <span
                className="d-block"
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  color: "rgba(255, 255, 255, 0.7)",
                  marginTop: "4px",
                }}
              >
                — {quote.author}
              </span>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      <style>{`
        .quotes-carousel-container .carousel-indicators {
          position: relative;
          margin: 15px 0 0 0;
          justify-content: flex-start;
          z-index: 1;
        }

        .quotes-carousel-container .carousel-indicators [data-bs-target] {
          width: 30px;
          height: 4px;
          border-radius: 2px;
          border: none;
          background-color: rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          margin-right: 8px;
        }

        .quotes-carousel-container .carousel-indicators .active {
          width: 50px;
          background-color: #01edc6 !important;
        }

        .carousel-indicators [data-bs-target]:focus {
            outline: none;
            box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default AuthLeftQuotes;

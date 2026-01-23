import { Carousel } from "react-bootstrap";

const AuthLeftQuotes = () => {
  const quotes = [
    { text: "Great things never come from comfort zones.", author: "Admin" },
    {
      text: "Experience is the simply name we give our mistakes.",
      author: "Oscar Wilde",
    },
    {
      text: "The web as I envisaged it, we have not seen it yet. The future is still so much bigger than the past.",
      author: "Tim Berners-Lee",
    },
  ];

  return (
    <div className="mt-auto">
      <div className="mb-3">
        <i className="ri-double-quotes-l display-4 text-success" />
      </div>

      <Carousel
        indicators={true}
        controls={false}
        interval={2000}
        fade={true}
        id="qoutescarouselIndicators"
      >
        {quotes.map((quote, index) => (
          <Carousel.Item key={index} className="text-center text-white pb-5">
            <p className="fs-15 fst-italic">"{quote.text}"</p>
            <span className="text-white-50 small">- {quote.author}</span>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default AuthLeftQuotes;

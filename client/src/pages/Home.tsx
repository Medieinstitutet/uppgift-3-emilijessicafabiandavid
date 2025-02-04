import "../styles/home.css";
import img1 from "../img/lvl1.png";
import img2 from "../img/lvl2.png";
import img3 from "../img/lvl3.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IProduct } from "../models/Article";

export const Home = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:3000/stripe/subscriptions")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched products:", data);
        setProducts(data.reverse());
        setIsLoading(false);
      });
  }, []);

  const getStartedClick = (product: IProduct) => {
    console.log("Selected product:", product);
    if (product.priceId) {
      navigate("/register", { state: { selectedProduct: product } });
    } else {
      console.error("Selected product is missing priceId");
    }
  };

  const descriptions = [
    [
      "Access to all articles on Alpaca News website and in the app",
      "E-newspaper all week - our digital version of the paper newspaper",
      "Share your subscription with 2 family members",
      "Crosswords and Sudoku",
      "Paper newspaper - choose between weekend or all week",
    ],
    [
      "Access to all articles on Alpaca News website and in the app",
      "E-newspaper all week - our digital version of the paper newspaper",
      "Share your subscription with 4 family members",
      "Crosswords and Sudoku",
      "Monthly exclusive video content on alpaca care and lifestyle",
      "Quarterly alpaca-themed gifts (e.g., small items like keychains or socks made of alpaca wool)",
      "Invitation to bi-monthly virtual alpaca farm tours",
    ],
    [
      "Includes all benefits of Alpacka Basic and Alpacka Insights, plus:",
      "Adopt an alpaca - receive updates and photos of your adopted alpaca",
      "Exclusive alpaca wool scarf sent to your home upon subscribing",
      "Monthly alpaca-themed gift (e.g., keychain, mug, or stationery)",
      "Invitation to virtual alpaca farm tours and live Q&A sessions with alpaca experts",
      "Annual alpaca farm visit - a day at an alpaca farm (travel not included)",
      "Personalized alpaca merchandise (e.g., a customized alpaca plush toy with your name)",
    ],
  ];

  return (
    <>
      <h1>ALPACA NEWS</h1>
      {isLoading ? (
        <div className="loading"></div>
      ) : (
        <div className="container">
          {products.map((product: IProduct, index: number) => (
            <div className="subscriptionBox" key={product.id}>
              <img
                className="productImage"
                src={index === 0 ? img1 : index === 1 ? img2 : img3}
                alt="Product Image"
                onClick={() => getStartedClick(product)}
              />
              <h2>{product.name}</h2>
              <h3>{product.price} kr/week</h3>
              <ul>
                {descriptions[index].map((description, i) => (
                  <li key={i}>{description}</li>
                ))}
              </ul>
              <button className="button" onClick={() => getStartedClick(product)}>
                GET STARTED
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Home;

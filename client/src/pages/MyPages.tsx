import { useState, useEffect, SetStateAction } from "react";
import axios from "axios";
import "../styles/mypages.css";
import { useAuth } from "../context/AuthContext";
import { IArticle } from "../models/Article";

export const MyPages = () => {
  const { stripeSessionId, user } = useAuth();
  const [subscriptionLevel, setSubscriptionLevel] = useState("");
  const [sortedArticles, setSortedArticles] = useState<IArticle[]>([]);
  const [nextBillingDate, setNextBillingDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [failedPaymentUrl, setFailedPaymentUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const isSubscriptionActive = () => {
    return nextBillingDate && new Date() < nextBillingDate;
  };

  const hasSubscriptionExpired = () => {
    return endDate && new Date() > endDate;
  };

  useEffect(() => {
    const storedSessionId = localStorage.getItem("stripeSessionId");
    console.log("Session ID from localStorage:", storedSessionId);
    if (!storedSessionId) {
      console.error("Session ID is missing");
      return;
    }

    axios
      .get("http://localhost:3000/subscription/session", {
        params: { sessionId: storedSessionId },
      })
      .then((response) => {
        console.log("Response from server:", response.data);
        setSubscriptionLevel(response.data.subscriptionLevel);
        setNextBillingDate(response.data.nextBillingDate ? new Date(response.data.nextBillingDate) : null);
        setEndDate(response.data.endDate ? new Date(response.data.endDate) : null);
        setStatus(response.data.status);

        if (response.data.status !== 'canceled' && isSubscriptionActive()) {
          getArticles(response.data.subscriptionLevel);
        }
      })
      .catch((error) => {
        console.error(
          "There was an error fetching the subscription level!",
          error
        );
      });

    if (status === "inactive" && user) {
      axios
        .post("http://localhost:3000/stripe/failed-payment-link", {
          userId: user._id,
        })
        .then((response) => {
          console.log("Failed payment link response:", response.data);
          setFailedPaymentUrl(response.data.url);
        })
        .catch((error) => {
          console.error(
            "There was an error fetching the failed payment link!",
            error
          );
        });
    }

    const getArticles = (level: string) => {
      fetch("http://localhost:3000/articles/articles")
        .then((response) => response.json())
        .then((data) => {
          console.log("articles: ", data);

          let articles: IArticle[] = data.default;

          const articlesForLevel: SetStateAction<IArticle[]> = [];
          console.log(level);
          if (level === "Alpaca Elite") {
            articles.map((article) => {
              articlesForLevel.push(article);
            });
          } else if (level === "Alpaca Insights") {
            articles.map((article) => {
              if (article.level === level || article.level === "Alpaca Basic") {
                articlesForLevel.push(article);
              }
            });
          } else if (level === "Alpaca Basic") {
            articles.map((article) => {
              if (article.level === level) {
                articlesForLevel.push(article);
              }
            });
          } else {
            return;
          }

          setSortedArticles(articlesForLevel);
          console.log("articles for this users level: ", articlesForLevel);
          console.log(level);
        })
        .catch((error) => {
          console.error("Error fetching content pages:", error);
        });
    };
  }, [stripeSessionId, status, user]);

  // const handleUpgradeDowngrade = (level: string) => {
  //   const storedSessionId = stripeSessionId || localStorage.getItem("stripeSessionId");
  //   if (!storedSessionId) {
  //     console.error("Session ID is missing");
  //     return;
  //   }

  //   axios
  //     .post("http://localhost:3000/subscription", {
  //       sessionId: storedSessionId,
  //       subscriptionLevel: level,
  //     })
  //     .then((response) => {
  //       console.log("Updated subscription level to:", level);
  //       setSubscriptionLevel(level);
  //       alert(response.data.message);
  //     })
  //     .catch((error) => {
  //       console.error("There was an error updating the subscription level!", error);
  //     });
  // };

  const handleCancelSubscription = () => {
    const storedSessionId =
      stripeSessionId || localStorage.getItem("stripeSessionId");
    if (!storedSessionId) {
      console.error("Session ID is missing");
      return;
    }

    if (window.confirm("Vill du verkligen avsluta prenumerationen?")) {
      axios
        .post("http://localhost:3000/subscription/cancel", {
          sessionId: storedSessionId,
          subscriptionId: user?.stripeSubId,
        })
        .then((response) => {
          console.log("Subscription cancelled:", response.data);
          alert(response.data.message);
          setStatus('canceled');
          const nextBillingDate = new Date(response.data.subscription.nextBillingDate);
          setNextBillingDate(nextBillingDate);
          setEndDate(nextBillingDate); 
        })
        .catch((error) => {
          console.error(
            "There was an error cancelling the subscription!",
            error
          );
        });
    }
  };

  

const customerPortal = async () => {
  
  const portalResponse =  await axios 
  .post("http://localhost:3000/stripe/customer-portal", {stripeSubId: user?.stripeSubId});

  console.log(portalResponse.data.url);
  window.location.href = portalResponse.data.url;
}

  return (
    <div className="mypages-container">
      <h1 className="mypages-title">My Pages</h1>
      <p className="mypages-subscription">
        Current Subscription Level: <strong>{subscriptionLevel}</strong>
      </p>
      <p className="mypages-subscription">
        Next Billing Date:{" "}
        <strong>
          {nextBillingDate
            ? nextBillingDate.toLocaleDateString()
            : "Invalid Date"}
        </strong>
      </p>
      <p className="mypages-subscription">
        End Date:{" "}
        <strong>
          {endDate ? endDate.toLocaleDateString() : "Invalid Date"}
        </strong>
      </p>
      {failedPaymentUrl ? (
        <p className="mypages-subscription">
          No subscription
        </p>
      ) : (
        <>


          <h1>My Articles</h1>
          <div>
            {sortedArticles.map((article, index) => (
              <div key={index} className="contentPage">
                <h3>{article.title}</h3>
                <p>Level: {article.level}</p>
                <p>{article.description}</p>
              </div>
            ))}
          </div>
        </>
      )}



      <div className="mypages-buttons">
  <button className="mypages-button cancel-button" type="submit" onClick={customerPortal}>Ändra Abonnemang</button>
  </div>

      
      
                  
          {failedPaymentUrl && (
            <p className="mypages-subscription">
              Failed Payment: <a href={failedPaymentUrl}>Pay Now</a>
            </p>
          )}


          {!hasSubscriptionExpired() && (
            <div className="mypages-buttons">
              <button
                onClick={handleCancelSubscription}
                className="mypages-button cancel-button">
                Avsluta Abonemang
              </button>
            </div>
          )}
        
     
     
      
    </div>
  );
};



export default MyPages;

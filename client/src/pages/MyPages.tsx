import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/mypages.css";
import { useAuth } from "../context/AuthContext";

export const MyPages = () => {
  const { stripeSessionId } = useAuth();
  const [subscriptionLevel, setSubscriptionLevel] = useState("");
  const [nextBillingDate, setNextBillingDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");

  useEffect(() => {
    const storedSessionId =
      stripeSessionId || localStorage.getItem("stripeSessionId");
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
        setNextBillingDate(response.data.nextBillingDate);
        setEndDate(response.data.endDate);
        setSubscriptionId(response.data.subscriptionId);
      })
      .catch((error) => {
        console.error(
          "There was an error fetching the subscription level!",
          error
        );
      });
  }, [stripeSessionId]);

  const handleUpgradeDowngrade = (level: string) => {
    const storedSessionId =
      stripeSessionId || localStorage.getItem("stripeSessionId");
    if (!storedSessionId) {
      console.error("Session ID is missing");
      return;
    }

    axios
      .post("http://localhost:3000/subscription", {
        sessionId: storedSessionId,
        subscriptionLevel: level,
      })
      .then((response) => {
        console.log("Updated subscription level to:", level);
        setSubscriptionLevel(level);
        alert(response.data.message);
      })
      .catch((error) => {
        console.error(
          "There was an error updating the subscription level!",
          error
        );
      });
  };

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
          subscriptionId: subscriptionId,
        })
        .then((response) => {
          console.log("Subscription cancelled:", response.data);
          alert(response.data.message);
        })
        .catch((error) => {
          console.error(
            "There was an error cancelling the subscription!",
            error
          );
        });
    }
  };

  return (
    <div className="mypages-container">
      <h1 className="mypages-title">My Pages</h1>
      <p className="mypages-subscription">
        Current Subscription Level: <strong>{subscriptionLevel}</strong>
      </p>
      <p className="mypages-subscription">
        Next Billing Date: <strong>{new Date(nextBillingDate).toLocaleDateString()}</strong>
      </p>
      <p className="mypages-subscription">
        End Date: <strong>{new Date(endDate).toLocaleDateString()}</strong>
      </p>

      <div className="mypages-buttons">
        <p className="mypages-change-text">Change Subscription Level:</p>
        <button
          onClick={() => handleUpgradeDowngrade("basic")}
          className="mypages-button">
          Basic
        </button>
        <button
          onClick={() => handleUpgradeDowngrade("insights")}
          className="mypages-button">
          Insight
        </button>
        <button
          onClick={() => handleUpgradeDowngrade("elite")}
          className="mypages-button">
          Elite
        </button>
      </div>
      <div className="mypages-buttons">
        <button
          onClick={handleCancelSubscription}
          className="mypages-button cancel-button">
          Avsluta Abonemang
        </button>
      </div>
      <h1>My Articles</h1>
      <div></div>
    </div>
  );
};

export default MyPages;


// import { useState, useEffect } from "react";
// import axios from "axios";
// import "../styles/mypages.css";
// import { useAuth } from "../context/AuthContext";

// export const MyPages = () => {
//   const { stripeSessionId } = useAuth();
//   const [subscriptionLevel, setSubscriptionLevel] = useState("");
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const storedSessionId =
//       stripeSessionId || localStorage.getItem("stripeSessionId");
//     console.log("Session ID from localStorage:", storedSessionId);
//     if (!storedSessionId) {
//       console.error("Session ID is missing");
//       return;
//     }

//     axios
//       .get("http://localhost:3000/subscription/session", {
//         params: { sessionId: storedSessionId },
//       })
//       .then((response) => {
//         console.log("Response from server:", response.data);
//         setSubscriptionLevel(response.data.subscriptionLevel);
//       })
//       .catch((error) => {
//         console.error(
//           "There was an error fetching the subscription level!",
//           error
//         );
//       });
//   }, [stripeSessionId]);

//   const handleUpgradeDowngrade = (level: string) => {
//     const storedSessionId =
//       stripeSessionId || localStorage.getItem("stripeSessionId");
//     if (!storedSessionId) {
//       console.error("Session ID is missing");
//       return;
//     }

//     axios
//       .post("http://localhost:3000/subscription", {
//         sessionId: storedSessionId,
//         subscriptionLevel: level,
//       })
//       .then((response) => {
//         console.log("Updated subscription level to:", level);
//         setSubscriptionLevel(level);
//         setMessage(`Ditt abonemang kommer ${subscriptionLevel === "basic" ? "uppgraderas" : "nergraderas"} från nextBillingDate.`);
//         alert(response.data.message);
//       })
//       .catch((error) => {
//         console.error(
//           "There was an error updating the subscription level!",
//           error
//         );
//       });
//   };

//   const handleCancelSubscription = () => {
//     const storedSessionId =
//       stripeSessionId || localStorage.getItem("stripeSessionId");
//     if (!storedSessionId) {
//       console.error("Session ID is missing");
//       return;
//     }

//     if (window.confirm("Vill du verkligen avsluta prenumerationen?")) {
//       axios
//         .post("http://localhost:3000/subscription/cancel", {
//           sessionId: storedSessionId,
//         })
//         .then((response) => {
//           console.log("Subscription cancelled:", response.data);
//           setMessage("Ditt abonemang kommer avslutas från endDate.");
//           alert(response.data.message);
//         })
//         .catch((error) => {
//           console.error(
//             "There was an error cancelling the subscription!",
//             error
//           );
//         });
//     }
//   };

//   return (
//     <div className="mypages-container">
//       <h1 className="mypages-title">My Pages</h1>
//       <p className="mypages-subscription">
//         Current Subscription Level: <strong>{subscriptionLevel}</strong>
//       </p>

//       <div className="mypages-buttons">
//         <p className="mypages-change-text">Change Subscription Level:</p>
//         <button
//           onClick={() => handleUpgradeDowngrade("basic")}
//           className="mypages-button">
//           Basic
//         </button>
//         <button
//           onClick={() => handleUpgradeDowngrade("insights")}
//           className="mypages-button">
//           Insight
//         </button>
//         <button
//           onClick={() => handleUpgradeDowngrade("elite")}
//           className="mypages-button">
//           Elite
//         </button>
//       </div>
//       <div className="mypages-buttons">
//         <button
//           onClick={handleCancelSubscription}
//           className="mypages-button cancel-button">
//           Avsluta Abonemang
//         </button>
//       </div>
//       {message && (
//         <div className="subscription-message">
//           <p>{message}</p>
//         </div>
//       )}
//       <h1>My Articles</h1>
//       <div></div>
//     </div>
//   );
// };

// export default MyPages;


// import { useState, useEffect } from "react";
// import axios from "axios";
// import "../styles/mypages.css";
// import { useAuth } from "../context/AuthContext";

// export const MyPages = () => {
//   const { stripeSessionId } = useAuth();
//   const [subscriptionLevel, setSubscriptionLevel] = useState("");

//   useEffect(() => {
//     const storedSessionId =
//       stripeSessionId || localStorage.getItem("stripeSessionId");
//     console.log("Session ID from localStorage:", storedSessionId);
//     if (!storedSessionId) {
//       console.error("Session ID is missing");
//       return;
//     }

//     axios
//       .get("http://localhost:3000/subscription/session", {
//         params: { sessionId: storedSessionId },
//       })
//       .then((response) => {
//         console.log("Response from server:", response.data);
//         setSubscriptionLevel(response.data.subscriptionLevel);
//       })
//       .catch((error) => {
//         console.error(
//           "There was an error fetching the subscription level!",
//           error
//         );
//       });
//   }, [stripeSessionId]);

//   const handleUpgradeDowngrade = (level: string) => {
//     const storedSessionId =
//       stripeSessionId || localStorage.getItem("stripeSessionId");
//     if (!storedSessionId) {
//       console.error("Session ID is missing");
//       return;
//     }

//     axios
//       .post("http://localhost:3000/subscription", {
//         sessionId: storedSessionId,
//         subscriptionLevel: level,
//       })
//       .then((response) => {
//         console.log("Updated subscription level to:", level);
//         setSubscriptionLevel(level);
//         alert(response.data.message);
//       })
//       .catch((error) => {
//         console.error(
//           "There was an error updating the subscription level!",
//           error
//         );
//       });
//   };

//   const handleCancelSubscription = () => {
//     const storedSessionId =
//       stripeSessionId || localStorage.getItem("stripeSessionId");
//     if (!storedSessionId) {
//       console.error("Session ID is missing");
//       return;
//     }

//     if (window.confirm("Vill du verkligen avsluta prenumerationen?")) {
//       axios
//         .post("http://localhost:3000/subscription/cancel", {
//           sessionId: storedSessionId,
//         })
//         .then((response) => {
//           console.log("Subscription cancelled:", response.data);
//           alert(response.data.message);
//         })
//         .catch((error) => {
//           console.error(
//             "There was an error cancelling the subscription!",
//             error
//           );
//         });
//     }
//   };

//   return (
//     <div className="mypages-container">
//       <h1 className="mypages-title">My Pages</h1>
//       <p className="mypages-subscription">
//         Current Subscription Level: <strong>{subscriptionLevel}</strong>
//       </p>

//       <div className="mypages-buttons">
//         <p className="mypages-change-text">Change Subscription Level:</p>
//         <button
//           onClick={() => handleUpgradeDowngrade("basic")}
//           className="mypages-button">
//           Basic
//         </button>
//         <button
//           onClick={() => handleUpgradeDowngrade("insights")}
//           className="mypages-button">
//           Insight
//         </button>
//         <button
//           onClick={() => handleUpgradeDowngrade("elite")}
//           className="mypages-button">
//           Elite
//         </button>
//       </div>
//       <div className="mypages-buttons">
//         <button
//           onClick={handleCancelSubscription}
//           className="mypages-button cancel-button">
//           Avsluta Abonemang
//         </button>
//       </div>
//       <h1>My Articles</h1>
//       <div></div>
//     </div>
//   );
// };

// export default MyPages;

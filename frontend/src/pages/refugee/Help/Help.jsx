// Node Module Imports
import React from "react";
import { useNavigate } from "react-router";

// Local Imports
import "./Help.css";

function Help({}) {
  // Constant Variables
  const navigate = useNavigate();
  return (
    <div className="Help">
      <div class="help-page">
        <header>
          <h1>Newcomer Network — Help & FAQ</h1>
          <p>
            Welcome to{" "}
            <a
              href="https://newcomernetwork.com"
              target="_blank"
              rel="noopener"
            >
              newcomernetwork.com
            </a>{" "}
            🌍 This page explains how refugees can use the site to find the help
            they need.
          </p>
        </header>

        <section id="overview">
          <h2>🌍 What is Newcomer Network?</h2>
          <p>
            Newcomer Network is a free platform that helps refugees quickly
            connect with local nonprofit services. You can enter your needs and
            receive personalized recommendations for nearby services like:
          </p>
          <ul>
            <li>Housing and shelter</li>
            <li>Food and nutrition programs</li>
            <li>Education and language classes</li>
            <li>Legal aid</li>
            <li>Healthcare</li>
            <li>Employment and training</li>
          </ul>
        </section>

        <section id="how-to">
          <h2>🛠 How to Use the Site</h2>
          <ol>
            <li>
              <strong>Describe your needs:</strong> Choose one or more service
              categories.
            </li>
            <li>
              <strong>Enter your location:</strong> Enter your address or
              provide a general area (like your city or ZIP code).
              <em>Your exact address is not stored.</em>
            </li>
            <li>
              <strong>Review matches:</strong> See services ranked by distance,
              language support, and hours of availability.
            </li>
            <li>
              <strong>Contact services:</strong> Use the contact information
              provided to reach out directly.
            </li>
          </ol>
        </section>

        <section id="privacy">
          <h2>🔒 Privacy and Safety</h2>
          <p>
            Your safety is our top priority. You can use the site without
            sharing sensitive details. We only ask for enough information to
            recommend the most useful services near you.
          </p>
        </section>

        <section id="faq">
          <h2>❓ Frequently Asked Questions</h2>
          <div class="faq-item">
            <h3>What if I want to switch my nonprofit </h3>
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault(); // prevents full page reload
              navigate("/");
            }}
          >
            Click here to change your Nonprofit
          </a>
          <div class="faq-item">
            <h3>Do you share my data with anyone?</h3>
            <p>
              No. Your data is{" "}
              <strong>never shared with outside parties</strong>.
            </p>
          </div>
          <div class="faq-item">
            <h3>Is my home address stored?</h3>
            <p>
              No. Refugee addresses are <strong>not stored</strong>. We only
              store a general location using only zipcode to help figure out
              where to add additional services. If you would like additional
              security you are welcome to use an address nearby where you are
              searching as results will be very similar
            </p>
          </div>
          <div class="faq-item">
            <h3>Can I use the site without creating an account?</h3>
            <p>
              Yes. You can search for services without registering. Creating a
              profile is optional.
            </p>
          </div>
          <div class="faq-item">
            <h3>What if I don’t speak English?</h3>
            <p>
              Many services list the languages they support. You can filter
              results by language.
            </p>
          </div>
        </section>

        <section id="contact">
          <h2>📧 Contact</h2>
          <p>
            If you need help using the site, email us at{" "}
            <a href="mailto:newcomernetworkweb@gmail.com">
              newcomernetworkweb@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

export default Help;

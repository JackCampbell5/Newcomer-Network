# Newcomer Network

### Live Site: [newcomernetwork.com](http://newcomernetwork.com/)

### Contact: newcomernetworkweb@gmail.com

## 🌍 Project Overview

Newcomer Network is a platform designed to help **refugees quickly integrate into their new communities** by matching them with local nonprofit services.

Nonprofits can add and manage their available services (housing, food, education, legal aid, healthcare, etc.), and refugees can input their needs and receive **personalized recommendations** based on location, availability, and relevance.

This project began as a **capstone collaboration with a refugee nonprofit in Maryland**, where disorganized data and difficulty connecting refugees with services highlighted the need for a structured, easy-to-use tool.

---

## ✨ Key Features

### MVP

- 🔑 **Secure Authentication** for nonprofits (sign up, log in, password reset).
- 📍 **Location-Based Matching** using Google Maps APIs to calculate driving distances.
- 🔎 **Search Tool** with filterable dropdowns for service categories, hours, and languages.
- 🕒 **Hours of Availability Table** for each service.
- 🏢 **Nonprofit Dashboard** to add, edit, and manage services.
- 📊 **Service Stats & Quick Add Tools** for nonprofits.

### Extended Features

- 📌 **Advanced Search Algorithm**

  - Dynamic weighting of results.
  - Ranks services based on distance, hours, language, popularity, and completeness of data.
  - Expands search radius if no matches are found nearby.

- 🤝 **Nonprofit Recommendation Engine**

  - Suggests services that nonprofits could add based on community needs.
  - Provides reasoning and match percentages.
  - Incorporates service popularity, distance, and keyword matching.

- 🛠️ **Quality of Life Enhancements**
  - Driving time calculation instead of raw coordinates.
  - Cleanly formatted search results and tables.
  - Tooltips for search filters.

---

## 🧩 Technical Challenges & Solutions

- **Search Algorithm**

  - Built from scratch, with dynamic weighting.
  - Incorporates distance, service hours, data completeness, and language availability.

- **Recommendation Algorithm**

  - Uses nonprofits as a center point to suggest nearby services.
  - Includes ranking logic, data normalization, and logging.

- **Data Management**

  - Seeded database with diverse sample data.
  - Prisma + PostgreSQL backend for reliability and scalability.

- **Deployment & Integration**
  - Connected frontend (React) and backend (Node/Express) on Vercel.
  - API authentication and session token management.

---

## ⚡ Initialization

- [Install Node.js](https://nodejs.org/en/download/)
- [Install PostgreSQL](https://www.postgresql.org/download/)
- [Initialize Frontend](./backend/)
- [Initialize Backend](./frontend/)

---

## ℹ️ Project Info

### Overall:

- **Version control:** Git
- **Code editing:** VSCode
- **Run code:** [Node](https://nodejs.org/docs/latest/api/)
- **Package Manager:** [Npm](https://docs.npmjs.com/)

### Database:

- **Database type:** [PostgreSQL](https://www.postgresql.org/docs/)
- **Software(Create)-** [pgadmin4](https://www.pgadmin.org/docs/pgadmin4/latest/index.html)
  - Need to have open for database to be active in development environment

### [Backend](./backend/):

- **Configure and Modify Database:**[Prisma](https://www.prisma.io/docs)
- **Create and Edit Endpoints:**[Express ](https://expressjs.com/)
- **Manage Endpoints and test:** [Insomnia](https://docs.insomnia.rest/)

### [Frontend](./frontend/):

- **Framework:**[ React with Vanilla JS](https://react.dev/index)
- **Create project:**[Vite](https://vite.dev/guide/why)
- **Icons:** [React icons](https://react-icons.github.io/react-icons/)

## 📝 Initial Project Requirements

<table>
  <tr>
   <td>Requirement
   </td>
   <td>How I addressed it
   </td>
  </tr>
  <tr>
   <td>⭐ Go beyond CodePath: Technical Challenges ⭐
   </td>
   <td>Your app provides multiple opportunities for you to solve technical challenges
   <ul>

   <li><a href="https://github.com/JackCampbell5/strong-start/blob/main/backend/utils/search/search-services.js">TC1: Search</a></li>

   <li><a href="https://github.com/JackCampbell5/strong-start/blob/main/backend/utils/recs/rec-services.js">TC2: Recommendations </a></li>

   <li><a href="https://docs.google.com/document/u/0/d/1hU_jAHVHUc9K7xqLxh4dRtvjB1Ym6WfL6J6gGTP-HHc/edit">My Approach to TC’s </a></li>
   </ul>
   </td>
  </tr>
  <tr>
   <td> Database & API Integration
   </td>
   <td>Your app interacts with a database (e.g. Parse)
   <ul>

   <li><a href="https://github.com/JackCampbell5/strong-start/blob/main/backend/prisma/schema.prisma">Prisma Config FIle in my project</a></li>
   <ul>

   <li>Prisma is used to store all services, users, nonprofits, and logs

   <p>
   Your app integrates with at least one API (that you didn’t learn about in CodePath) – free APIs only</li>
   </ul>

   <li><a href="https://github.com/JackCampbell5/strong-start/blob/1a1aca32c5ee789f452269403e08e1464384bdd2/backend/utils/search/address-utils.js#L18-L49">Search Text to Validate Address </a></li>

   <li><a href="https://github.com/JackCampbell5/strong-start/blob/1a1aca32c5ee789f452269403e08e1464384bdd2/backend/utils/search/direction-utils.js#L11-L43">Compute Routes for Finer Distance Calculation </a></li>

   <li><a href="https://github.com/JackCampbell5/strong-start/blob/1a1aca32c5ee789f452269403e08e1464384bdd2/backend/utils/recs/services-nearby.js#L34-L65">Search Text to find Nonprofits in the Local Area</a></li>
   </ul>
      </td>
   </tr>
   <tr>
      <td rowspan="2" > User Authentication
      </td>
      <td>You can log in/log out of your app as a user
   <ul>

   <li><a href="https://github.com/JackCampbell5/strong-start/blob/main/frontend/src/components/Login/Login.jsx">Login</a></li>

   <li><a href="https://github.com/JackCampbell5/strong-start/blob/1a1aca32c5ee789f452269403e08e1464384bdd2/frontend/src/utils/fetch/nonprofitEmployeeFetchUtils.js#L92-L115">Log Out</a></li>
   </ul>
      </td>
   </tr>
   <tr>
      <td>You can <a href="https://github.com/JackCampbell5/strong-start/blob/main/frontend/src/components/Register/Register.jsx">sign up with a new user profile</a>
      </td>
   </tr>
   <tr>
      <td>Visuals & Interactions
      </td>
      <td>
   <ul>

   <li>Your app has multiple views</li>

   <li><a href="https://github.com/JackCampbell5/strong-start/pull/37">Cursor interaction</a>- Custom Tooltips on Hover</li>
   <ul>

   <li>There is so much response validation on the backend adding custom tooltips to each field allows the user to clearly understand what they need to put in each field, saving time and API calls. </li>
   </ul>

   <li><a href="https://docs.google.com/document/d/1KDZQsxmDd9B77iZajkruIK40iAgcZlKTEbLR7kCnqL0/edit#heading=h.lnm34a8w3ois">Complex Visual styling</a> - Service display. </li>
   <ul>

   <li>The entire point of my site is being able to find services you are looking for. By styling the service component every time a service is displayed across the site the information clearly pops out. This allows a user to quickly scan and figure out what service to use. When clicking more details the rest of the params show up quickly in an order that makes them easy to scan. </li>
   </ul>

   <li><a href="https://docs.google.com/document/d/1KDZQsxmDd9B77iZajkruIK40iAgcZlKTEbLR7kCnqL0/edit#heading=h.39l0ddx9vhdg">Loading state</a>- Loading button Component </li>
   <ul>

   <li>The button initiates a loading animation upon clicking, rendering it unclickable while data is retrieved from the server. </li>
   </ul></li>
   </ul>
      </td>
   </tr>
</table>

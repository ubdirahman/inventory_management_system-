# Tilmaamaha Bilowga ee Server-ka (Beginner Guide)

Ku soo dhawaada mashruuca! Buug-yarahan wuxuu kuu sharaxayaa sida server-ka Node.js uu u shaqeeyo iyo meel kasta waxa loogu talagalay.

## 1. Sida loo kiciyo Server-ka
Ka hor inta aadan bilaabin, hubi in aad ku rakibatay Node.js.
*   **Ku rakib dependencies:** `npm install`
*   **Kici server-ka:** `npm start` ama `node server.js`
*   **Habka horumarinta (Dev mode):** `npm run dev` (tani waxay isticmaashaa nodemon si uu server-ku isu kiciyo markaad wax bedesho).

## 2. Qaab-dhismeedka Folder-ada (Folder Structure)
*   `server.js`: Waa halka uu mashruucu ka bilaawdo (Entry point).
*   `config/`: Waxaa ku jira habaynta database-ka (MongoDB).
*   `models/`: Waxaa ku jira qaabka xogta loo kaydiyo (Schema).
*   `routes/`: Waxaa ku jira waddooyinka (API Endpoints) sida `/api/auth/login`.
*   `controllers/`: Waxaa ku jira maskaxda server-ka (Logic-ga dhabta ah).
*   `middleware/`: Waxaa ku jira hubinta (Validation) iyo amniga.

## 3. Sidee wax u shaqeeyaan?
1.  **Request:** Isticmaalaha ayaa soo dira codsi (tusaale: login).
2.  **Route:** `server.js` ayaa u dira codsiga folder-ka `routes/`.
3.  **Controller:** Route-ka ayaa u sii gudbiya `controllers/` si loo hubiyo xogta.
4.  **Model:** Controller-ka ayaa la hadla `models/` si uu xog uga soo saaro database-ka.
5.  **Response:** Server-ka ayaa u jawaaba isticmaalaha.

---
*Haddii aad qabto su'aal, fadlan weydii Antigravity!*

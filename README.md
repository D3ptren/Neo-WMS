# **ΝΕΟ-WMS - Σύστημα Διαχείρισης Αποθήκης**

Αυτό το project αποτελεί μια σύγχρονη υλοποίηση συστήματος Warehouse Management System (WMS), αναπτυγμένο στα πλαίσια πανεπιστημιακής εργασίας. Η εφαρμογή επιτρέπει τη διαχείριση προϊόντων, τοποθεσιών και αποθεμάτων σε πραγματικό χρόνο, χρησιμοποιώντας μια modular αρχιτεκτονική.<br><br>
## **Τεχνολογικό Stack**<br>
**Backend:** **Python 3.10+** με το framework **FastAPI**. <br>
**Database:** **SQLite** (μέσω SQLAlchemy ORM) για εύκολη μεταφερσιμότητα.<br>
**Frontend:** **React 19** με **TypeScript** και **Vite**.<br>
**Styling:** **Tailwind CSS v4** για σύγχρονο και responsive περιβάλλον εργασίας.<br>
**API Communication:** Axios για τη σύνδεση Frontend-Backend.<br><br>
**Οδηγίες Εγκατάστασης & Λειτουργίας**<br>
Για να τρέξετε την εφαρμογή τοπικά, ακολουθήστε τα παρακάτω βήματα. Θα χρειαστείτε δύο τερματικά ανοιχτά ταυτόχρονα.<br><br>
### Προαπαιτούμενα (Prerequisites)
&emsp;***Python 3.10+***<br>
&emsp;***Node.js 18+***<br>
### **1. Ρύθμιση Backend (FastAPI)**<br>
&emsp;**1) Μεταβείτε στον φάκελο του backend:**<br>
~~~bash
      cd backend
~~~
&emsp;**2) Δημιουργήστε ένα εικονικό περιβάλλον (Virtual Environment):**<br>
~~~bash
      python -m venv venv
~~~
&emsp;**3) Ενεργοποιήστε το εικονικό περιβάλλον:**<br> 
&emsp;&emsp;&emsp;**Windows:** 
~~~bash
        .\venv\Scripts\activate
~~~
&emsp;&emsp;&emsp;**Mac/Linux:** 
~~~bash
        source venv/bin/activate
~~~
&emsp;**4) Εγκαταστήστε τις απαραίτητες βιβλιοθήκες:**<br>
~~~bash
      pip install -r requirements.txt
~~~
&emsp;**5) Εκκινήστε τον server:**<br>
~~~bash
      uvicorn app.main:app --reload
~~~
### **2. Ρύθμιση Frontend (React)**<br>
&emsp;**1) Σε ένα νέο τερματικό, μεταβείτε στον φάκελο του frontend:**<br>
~~~bash
      cd frontend
~~~
&emsp;**2) Εγκαταστήστε τα πακέτα του Node.js:**<br>
~~~bash
      npm install
~~~
&emsp;**3)Εκκινήστε την εφαρμογή:**<br>
~~~bash
      npm run dev
~~~
# Οδηγίες Χρήσης (Quick Start)
Μόλις ανοίξετε την εφαρμογή στον browser (localhost:5173):<br>
**1) Αρχική Σελίδα (Dashboard):** Δείτε τη γενική εικόνα της αποθήκης, τα γραφήματα κίνησης και τις κάρτες στατιστικών.<br>
**2) Τοποθεσίες (Locations):** Μεταβείτε στο μενού "Τοποθεσίες" και πατήστε το κουμπί **"Αυτόματη Δημιουργία (Seed)"**. Αυτό θα γεμίσει τη βάση με τα ράφια της αποθήκης (π.χ. Ζώνη Α, Ζώνη Β).<br>
**3) Προϊόντα (Products):** Μεταβείτε στο μενού "Προϊόντα". Μπορείτε να προσθέσετε νέα είδη χειροκίνητα ή να δείτε την υπάρχουσα λίστα σε έναν προηγμένο πίνακα με δυνατότητες αναζήτησης και φιλτραρίσματος.<br>
**4) Εργασίες (Tasks):** Εδώ μπορείτε να δείτε τον **PDA Simulator**. Πατώντας το κουμπί **"Seed Inventory"**, το σύστημα τοποθετεί αυτόματα προϊόντα στα ράφια, επιτρέποντάς σας να δοκιμάσετε τη διαδικασία **Picking** και **Putaway** σαν να είστε εργάτης αποθήκης.<br>

### API Documentation (Swagger)
Το FastAPI παρέχει αυτόματη τεκμηρίωση των endpoints. Με τον backend server ενεργό, επισκεφθείτε τη διεύθυνση:<br>
**http://127.0.0.1:8000/docs**<br>
Εκεί μπορείτε να δοκιμάσετε όλες τις λειτουργίες της βάσης δεδομένων (POST, GET, κλπ) απευθείας.<br>

### Δομή Project
&emsp;**backend/app/models:** Ορισμός πινάκων βάσης δεδομένων.<br>
&emsp;**backend/app/api:** Διαδρομές (Endpoints) του API.<br>
&emsp;**backend/app/crud:** Λογική διαχείρισης δεδομένων.<br>
&emsp;**frontend/src/components:** Επαναχρησιμοποιούμενα UI components (InventoryTable, Sidebar, κλπ).<br>
&emsp;**frontend/src/pages:** Οι κύριες σελίδες της εφαρμογής.<br>

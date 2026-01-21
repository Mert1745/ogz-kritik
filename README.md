# OGZ Kritik

🌐 **[ogzkritik.com](https://ogzkritik.com)**

**OGZ Kritik** is a web application for browsing and analyzing video game reviews and articles from Turkish gaming magazine **Oyungezer**. The application provides an interactive interface to explore game reviews, magazines, and authors with advanced filtering and search capabilities.

## 🎮 About

This application allows users to:
- **Browse Reviews**: Search and filter through video game reviews with advanced criteria including scores, sections, authors, and more
- **Explore Magazines**: View magazine issues and their contents with detailed filtering options
- **Discover Authors**: Find reviews by specific authors and explore their work
- **Analyze Data**: Interactive charts and statistics for game reviews and ratings

The data is loaded from Excel files stored in AWS S3.

## 🚀 Features

- **Advanced Filtering System**: Filter reviews by:
  - Game title
  - Author
  - Score ranges
  - Magazine sections
  - Issue numbers and years
  
- **Magazine Browser**: Browse through magazine issues with:
  - Issue-specific filtering
  - Detailed magazine information
  - Cross-page filter persistence using signal-based service
  
- **Responsive Design**: Mobile-friendly interface built with PrimeNG components
- **Server-Side Rendering (SSR)**: Fast initial page loads with Angular Universal
- **Excel Data Integration**: Automatic loading and caching of review data from S3

## 🛠️ Tech Stack

- **Framework**: Angular 21 with standalone components
- **UI Library**: PrimeNG 21 (Aura theme)
- **Styling**: TailwindCSS
- **Charts**: Chart.js
- **Data Processing**: XLSX (SheetJS)
- **Backend**: Express.js for SSR
- **State Management**: Angular Signals

## 📋 Prerequisites

Before running this project, ensure you have the following installed:
- **Node.js**: v18.x or higher
- **npm**: v11.6.2 or higher (included with Node.js)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ogz-kritik
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

For desktop development:

```bash
npm start
# or
ng serve
```

For mobile testing (accessible from other devices on your network):

```bash
npm run start:mobile
# or
ng serve --host 0.0.0.0
```

The application will be available at:
- **Desktop**: `http://localhost:4200/`
- **Mobile**: `http://<your-ip-address>:4200/`

The application will automatically reload when you modify source files.


## 📝 Development Notes

- The application uses **Angular Signals** for reactive state management
- **Magazine filter state** is shared between magazine and magazine-detail pages using `MagazineFilterService`
- **Review page filters** are independent and separate from magazine filters
- Excel data is automatically fetched from AWS S3 and cached for performance

## 🤝 Contributing

When contributing to this project:
1. Follow the existing code style (Prettier configuration is included)
2. Use Angular standalone components
3. Maintain signal-based state management
4. Test responsive design on both desktop and mobile

---

Built with ❤️ using Angular 21 and PrimeNG

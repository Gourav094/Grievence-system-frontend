
# Grievance Management System

A modern web application for submitting and managing user grievances, with separate interfaces for users and administrators.

![Grievance Management System](https://via.placeholder.com/800x400?text=Grievance+Management+System)

## 🌟 Features

### For Users
- **Account Management**: Create an account and log in securely
- **Grievance Submission**: Submit detailed grievances with categories
- **Tracking System**: Track the status of submitted grievances
- **Communication**: Comment on grievances and receive updates

### For Administrators
- **Dashboard Overview**: View statistics and recent grievances
- **Management Tools**: Process, update status, and respond to grievances
- **User Communication**: Provide feedback through the commenting system

## 💻 Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router
- **Build Tool**: Vite
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/grievance-management-system.git
cd grievance-management-system
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
Navigate to `http://localhost:8080` to view the application.

## 📱 Usage

### User Flow
1. Sign up for a new account or log in
2. Navigate to the dashboard
3. Submit a new grievance or track existing ones
4. Add comments to provide additional information

### Admin Flow
1. Log in with admin credentials
2. View all grievances from the dashboard
3. Process grievances by updating their status
4. Respond to users through comments

## 🔐 Authentication

The system includes mock authentication with two roles:
- **User**: Can submit and track grievances
- **Admin**: Can view all grievances and manage their status

## 📝 Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context for global state management
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── pages/          # Main application pages
└── services/       # Service layer for data operations
```

## 🔧 Customization

You can customize the application by:
- Modifying the color theme in `tailwind.config.ts`
- Adding new categories in the `CATEGORIES` array in `GrievanceForm.tsx`
- Extending the model with additional fields in `grievanceService.ts`

## 🔄 Future Enhancements

- **Real Database Integration**: Replace the mock data with a real database
- **Email Notifications**: Send emails for status updates
- **File Attachments**: Allow users to upload supporting documents
- **Analytics Dashboard**: Provide visualizations of grievance data

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

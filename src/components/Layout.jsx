import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ title, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Header title={title} />
        <main className="page-content animate-fade">
          {children}
        </main>
      </div>
    </div>
  );
}

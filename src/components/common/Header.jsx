import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="header">
      <h2>Data Labeling System</h2>
      <div>
        {user.name} | <b>{user.role}</b>
      </div>
    </header>
  );
}

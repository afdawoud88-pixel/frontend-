import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// استدعاء مكوناتك التي صممناها سابقاً
import FinanceDashboard from './FinanceDashboard';
import TrafficDashboard from './TrafficDashboard';
import SalesDashboard from './SalesDashboard';

// *** ضع رابط Render هنا ***
export const API_BASE_URL = 'https://eubss-sales-project-app.onrender.com';

export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
      else setUserRole(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId) => {
    const { data } = await supabase.from('user_profiles').select('role').eq('id', userId).single();
    if (data) setUserRole(data.role);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await supabase.auth.signInWithPassword({ email, password });
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans rtl">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-lg w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">نظام إدارة الوكالة</h1>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد" className="w-full mb-4 p-2 border rounded text-left" dir="ltr" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full mb-6 p-2 border rounded text-left" dir="ltr" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold">دخول</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans rtl">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center mb-6">
        <h1 className="font-bold text-xl">لوحة القيادة ({userRole})</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-red-600 font-bold">تسجيل الخروج</button>
      </nav>

      <main>
        {userRole === 'sales' && <SalesDashboard session={session} apiUrl={API_BASE_URL} />}
        {userRole === 'operations' && <TrafficDashboard session={session} apiUrl={API_BASE_URL} />}
        {userRole === 'finance' && <FinanceDashboard session={session} apiUrl={API_BASE_URL} />}
      </main>
    </div>
  );
}
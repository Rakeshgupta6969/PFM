import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, PieChart, CreditCard, Settings, Wallet, TrendingUp, DollarSign, RefreshCw, BarChart2, Plus, Trash2 } from 'lucide-react';
import LinkBank from '../components/LinkBank';
import SpendingPieChart from '../components/Charts/SpendingPieChart';
import MonthlyBarChart from '../components/Charts/MonthlyBarChart';
import BudgetWidget from '../components/BudgetWidget';
import TransactionModal from '../components/TransactionModal';
import api from '../utils/api';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [accounts, setAccounts] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgetLimit, setBudgetLimit] = useState(1500);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch data in parallel
      const [accountsRes, summaryRes, budgetRes, txRes] = await Promise.allSettled([
        api.get('/plaid/accounts'),
        api.get('/finance/summary'),
        api.get('/finance/budget'),
        api.get('/finance/transactions')
      ]);

      if (accountsRes.status === 'fulfilled') setAccounts(accountsRes.value.data);
      if (summaryRes.status === 'fulfilled') setSummaryData(summaryRes.value.data);
      if (budgetRes.status === 'fulfilled') setBudgetLimit(budgetRes.value.data.limit);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteParams = async (id) => {
    if (!window.confirm("Delete transaction?")) return;
    try {
      await api.delete(`/finance/transactions/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalNetWorth = accounts.reduce((sum, acc) => sum + (acc.balanceCurrent || 0), 0);
  const monthlySpent = summaryData?.monthlySpent || 0;

  return (
    <div className="min-h-screen bg-black text-gray-100 flex relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-[50%] h-[50%] rounded-full bg-brand-600/10 blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-72 glass-card border-r border-white/5 hidden md:flex flex-col relative z-20">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <div className="bg-gradient-to-tr from-brand-600 to-brand-400 p-2 rounded-xl mr-3 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Nexus
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          <a href="#" className="flex items-center px-4 py-3 bg-white/5 text-white rounded-xl border border-white/10 shadow-sm transition-all">
            <Home className="h-5 w-5 mr-3 text-brand-400" />
            <span className="font-semibold text-sm tracking-wide">Overview</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <CreditCard className="h-5 w-5 mr-3" />
            <span className="font-medium text-sm tracking-wide">Accounts</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <PieChart className="h-5 w-5 mr-3" />
            <span className="font-medium text-sm tracking-wide">Budgets</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <Settings className="h-5 w-5 mr-3" />
            <span className="font-medium text-sm tracking-wide">Settings</span>
          </a>
        </nav>
        
        <div className="p-6 border-t border-white/5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between mb-4">
             <div className="flex items-center gap-3 top-[-10px]">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-inner">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{user?.name}</span>
                  <span className="text-xs text-gray-400">Pro Plan</span>
                </div>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all font-medium text-sm border border-transparent hover:border-red-400/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-20 h-screen overflow-hidden">
        <header className="h-20 glass-card border-b border-white/5 flex items-center px-6 sm:px-10 sticky top-0 z-30">
          <h1 className="text-2xl font-bold text-white md:hidden">Nexus</h1>
          <div className="ml-auto flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-brand-600/20 text-brand-400 hover:bg-brand-600/40 rounded-lg transition-colors flex items-center gap-2 font-medium border border-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
            <button 
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-brand-400' : 'text-gray-400'}`} />
            </button>
            <LinkBank onSuccessLink={fetchDashboardData} />
          </div>
        </header>

        {isModalOpen && (
          <TransactionModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchDashboardData();
            }} 
          />
        )}

        <div className="flex-1 overflow-auto p-6 sm:p-10 hide-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Financial Overview</h2>
              <p className="text-gray-400 mt-2">Track your net worth, spending, and financial health.</p>
            </div>

            {/* Top Stat Level */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              <div className="glass-card p-6 rounded-3xl border border-white/5 lg:col-span-1 flex flex-col justify-between hover:border-brand-500/30 transition-all group">
                <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Total Net Worth</p>
                      <div className="p-2 bg-brand-500/10 rounded-lg">
                        <DollarSign className="w-5 h-5 text-brand-400" />
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-white tracking-tight">
                      ${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-emerald-400 font-medium flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +2.4%
                      </span>
                      <span className="ml-2 text-gray-500">from last month</span>
                    </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-400">Connected Accounts</p>
                        <CreditCard className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-white tracking-tight">{accounts.length}</p>
                </div>
              </div>

              {/* Dynamic Budget Widget */}
              <div className="glass-card p-6 rounded-3xl border border-white/5 lg:col-span-2 hover:border-purple-500/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Monthly Budget Tracker</p>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <PieChart className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <BudgetWidget 
                   monthlySpent={monthlySpent} 
                   budgetLimit={budgetLimit} 
                   onBudgetUpdated={fetchDashboardData} 
                />
              </div>
            </div>

            {/* Charts Row */}
            {summaryData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Spending Trend */}
                 <div className="glass-card p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                           <h3 className="text-lg font-semibold text-white">Spending Trend</h3>
                           <p className="text-sm text-gray-400">Past 30 days visualization</p>
                        </div>
                        <BarChart2 className="text-gray-400 w-5 h-5" />
                    </div>
                    <MonthlyBarChart data={summaryData.barChartData} />
                 </div>

                 {/* Categorical Breakdown */}
                 <div className="glass-card p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                           <h3 className="text-lg font-semibold text-white">Expense Distribution</h3>
                           <p className="text-sm text-gray-400">Spending by category</p>
                        </div>
                        <PieChart className="text-gray-400 w-5 h-5" />
                    </div>
                    <SpendingPieChart data={summaryData.pieChartData} />
                 </div>
              </div>
            )}

            {/* Accounts Table List */}
            {accounts.length > 0 && (
              <div className="glass-card rounded-3xl border border-white/5 overflow-hidden mt-6">
                <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Active Connections</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {accounts.map(account => (
                    <div key={account._id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                          <CreditCard className="h-6 w-6 text-brand-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-lg">{account.name}</p>
                          <p className="text-sm text-gray-400 capitalize">{account.subtype} • {account.officialName || 'Standard Account'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">
                          ${(account.balanceCurrent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-400">Current Balance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ledger */}
            {transactions.length > 0 && (
               <div className="glass-card rounded-3xl border border-white/5 overflow-hidden mt-6">
                 <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
                   <h3 className="text-lg font-semibold text-white">Recent Ledger Log</h3>
                 </div>
                 <div className="divide-y divide-white/5">
                   {transactions.map(txn => (
                     <div key={txn._id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                       <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                           <DollarSign className="h-5 w-5 text-purple-400" />
                         </div>
                         <div>
                           <p className="font-semibold text-white">{txn.name}</p>
                           <p className="text-sm text-gray-400">
                             {new Date(txn.date).toLocaleDateString()} • {txn.category[0] || 'Uncategorized'}
                           </p>
                         </div>
                       </div>
                       <div className="flex items-center gap-4">
                         <p className="text-lg font-bold text-brand-400">
                           ${txn.amount.toFixed(2)}
                         </p>
                         <button 
                           onClick={() => handleDeleteParams(txn._id)}
                           className="p-2 text-red-500/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all font-bold group-hover:scale-100 scale-90"
                           title="Delete"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

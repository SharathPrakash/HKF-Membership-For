
import React, { useState, useEffect } from 'react';
import type { IFormData } from './types';
import { PrintableView } from './components/PrintableView';

const logoHKF = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233B82F6'/%3E%3Ctext x='50' y='62' font-size='40' fill='white' text-anchor='middle' font-family='sans-serif' font-weight='bold'%3EHKF%3C/text%3E%3C/svg%3E";

declare const jspdf: any;
declare const html2canvas: any;

const AdminDashboard: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    
    const [submissions, setSubmissions] = useState<IFormData[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [selectedItem, setSelectedItem] = useState<IFormData | null>(null);
    const [adminComment, setAdminComment] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Attempting login for:", email.trim());
        if (email.trim() === 'contact@hamburgkannadamitraru.com' && password.trim() === 'Hkm@dashboard2025') {
            setIsLoggedIn(true);
            setLoginError('');
        } else {
            setLoginError('Incorrect credentials.');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        console.log("ADMIN LOG: Initiating data fetch from ./api/fetch-submissions.php");
        try {
            const res = await fetch('./api/fetch-submissions.php');
            const data = await res.json();
            
            if (data.success) {
                console.info(`ADMIN LOG: Successfully fetched ${data.submissions.length} records.`);
                if (data.submissions.length > 0) {
                    console.log("ADMIN LOG: Sample record data below:");
                    console.table(data.submissions.slice(0, 3).map((s: any) => ({
                        id: s.id,
                        hkfId: s.hkfId,
                        name: `${s.firstName} ${s.lastName}`,
                        status: s.status || 'NULL/EMPTY'
                    })));
                } else {
                    console.warn("ADMIN LOG: Server returned 0 records. Check if database table 'submissions' is empty.");
                }
                setSubmissions(data.submissions);
            } else {
                console.error("ADMIN LOG: Server responded with error status:", data.message);
                alert("Server error: " + data.message);
            }
        } catch (e) {
            console.error("ADMIN LOG: Critical fetch failure. Possible causes: CORS, 404, or invalid JSON output from PHP.", e);
            alert("Connection failure. Check console logs for details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn) fetchData();
    }, [isLoggedIn]);

    const updateStatus = async (id: number | string, status: string) => {
        setIsUpdating(true);
        console.log(`ADMIN LOG: Updating record ${id} to status: ${status}`);
        try {
            const res = await fetch('./api/update-submission.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, comments: adminComment })
            });
            const data = await res.json();
            if (data.success) {
                console.log("ADMIN LOG: Status update successful.");
                fetchData();
                setSelectedItem(null);
                setAdminComment('');
            }
        } catch (e) { 
            console.error("ADMIN LOG: Update failed.", e);
            alert("Update failed."); 
        } finally { setIsUpdating(false); }
    };

    const handleDownload = async (item: IFormData) => {
        try {
            const pdf = new jspdf();
            const element = document.getElementById('dashboard-reconstruct-content');
            if (!element) return;
            const canvas = await html2canvas(element, { scale: 2 });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
            pdf.save(`HKF_${item.hkfId || item.id}.pdf`);
        } catch (err) { alert("PDF Reconstruction failed."); }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
                    <img src={logoHKF} className="h-16 mx-auto mb-6" alt="HKF" />
                    <h2 className="text-2xl font-bold text-center mb-2">Admin Panel</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                        <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                        {loginError && <p className="text-red-500 text-xs text-center">{loginError}</p>}
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">Enter Dashboard</button>
                    </form>
                    <div className="mt-6 text-center text-xs text-gray-400">
                        <a href="#/" className="hover:text-blue-600">Back to Public Form</a>
                    </div>
                </div>
            </div>
        );
    }

    // Stats Calculation
    const stats = {
        total: submissions.length,
        // Fixed: Simplified the logic to handle missing or pending status correctly.
        // The check s.status === '' was causing overlap errors; !s.status handles null, undefined, and empty string.
        pending: submissions.filter(s => !s.status || s.status.trim().toLowerCase() === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length
    };

    // Chart Data Calculation
    const yearStats = submissions.reduce((acc: any, s) => {
        const year = s.created_at ? s.created_at.split('-')[0] : 'Legacy';
        acc[year] = (acc[year] || 0) + 1;
        return acc;
    }, {});

    const filtered = submissions.filter(s => {
        if (activeTab === 'all') return true;
        const currentStatus = s.status ? s.status.trim().toLowerCase() : '';
        if (activeTab === 'pending') return currentStatus === '' || currentStatus === 'pending' || !s.status;
        return currentStatus === activeTab;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {selectedItem && (
                <div style={{ position: 'absolute', left: '-9999px' }}>
                    <PrintableView 
                        formData={selectedItem} 
                        signatureDataUrl={selectedItem.signature || null} 
                        hkfId={selectedItem.hkfId || null} 
                        containerId="dashboard-reconstruct-content" 
                    />
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <img src={logoHKF} className="h-12" />
                        Admin Dashboard
                    </h1>
                    <div className="flex gap-4">
                        <button onClick={fetchData} className="px-4 py-2 bg-white border rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all">Refresh Data</button>
                        <button onClick={()=>window.location.hash='#/'} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-red-600 transition-all">Log Out</button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Records', count: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Pending / New', count: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                        { label: 'Approved', count: stats.approved, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Rejected', count: stats.rejected, color: 'text-red-600', bg: 'bg-red-50' },
                    ].map(st => (
                        <div key={st.label} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col items-center">
                            <div className={`${st.bg} ${st.color} px-3 py-1 rounded-full text-[10px] font-black uppercase mb-3`}>{st.label}</div>
                            <p className={`text-4xl font-black ${st.color}`}>{st.count}</p>
                        </div>
                    ))}
                </div>

                {/* Yearly Trends Graph */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-8">Yearly Application Growth</h3>
                    <div className="flex items-end gap-6 h-48 px-4">
                        {Object.entries(yearStats).sort().map(([year, count]: any) => (
                            <div key={year} className="flex-1 flex flex-col items-center group relative">
                                <div className="absolute -top-10 bg-gray-900 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10">{count} submissions</div>
                                <div className="w-full bg-blue-100 rounded-t-2xl flex items-end overflow-hidden" style={{ height: `${Math.max(10, (count/stats.total)*100)}%` }}>
                                    <div className="w-full bg-blue-600 rounded-t-2xl transition-all duration-1000" style={{ height: '70%' }}></div>
                                </div>
                                <p className="text-xs font-bold text-gray-400 mt-3">{year}</p>
                            </div>
                        ))}
                        {Object.keys(yearStats).length === 0 && <div className="w-full h-full flex items-center justify-center text-gray-300 italic">No data to display</div>}
                    </div>
                </div>

                {/* Table View */}
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                            <button 
                                key={tab} 
                                onClick={()=>setActiveTab(tab)}
                                className={`flex-1 py-5 text-sm font-bold capitalize transition-all ${activeTab === tab ? 'text-blue-600 bg-blue-50/30 border-b-2 border-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                {tab === 'all' ? 'All Records' : tab === 'pending' ? 'New/Pending' : tab}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">HKF-ID</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Applicant</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-20 text-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div><p className="mt-4 text-gray-400 text-sm">Fetching records...</p></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={4} className="p-20 text-center text-gray-400 italic">No records found for this category.</td></tr>
                                ) : filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-8 py-5 font-mono text-xs text-gray-400">{item.hkfId || `ID-${item.id}`}</td>
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-gray-900">{item.firstName} {item.lastName}</p>
                                            <p className="text-[10px] text-gray-400">{item.email}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.status === 'approved' ? 'bg-green-100 text-green-700' : item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {item.status || 'NEW'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button onClick={()=>setSelectedItem(item)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white">Review</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Application Detail Sidebar/Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] max-w-4xl w-full p-10 shadow-2xl overflow-y-auto max-h-[95vh]">
                        <div className="flex justify-between items-start mb-10 border-b pb-8">
                            <div>
                                <h2 className="text-4xl font-black text-gray-900 leading-tight">{selectedItem.firstName} {selectedItem.lastName}</h2>
                                <p className="text-gray-400 font-medium">Official Membership Review — {selectedItem.hkfId || 'LEGACY'}</p>
                            </div>
                            <button onClick={()=>setSelectedItem(null)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-8 rounded-[32px]">
                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">Personal Particulars</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-400 text-sm">DOB</span><span className="font-bold">{selectedItem.dob}</span></div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-400 text-sm">Gender</span><span className="font-bold capitalize">{selectedItem.gender}</span></div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-400 text-sm">Location</span><span className="font-bold text-right">{selectedItem.city} ({selectedItem.postalCode})</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400 text-sm">Contact</span><span className="font-bold">{selectedItem.phone}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-blue-50/40 border border-blue-100 p-8 rounded-[32px]">
                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">Financial Context (IBAN)</h4>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">German IBAN</p>
                                        <p className="font-mono text-lg font-black text-blue-700 break-all">{selectedItem.iban}</p>
                                    </div>
                                </div>
                                <div className="px-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Stored Signature</p>
                                    <div className="h-32 bg-white border border-gray-100 rounded-3xl flex items-center justify-center p-4">
                                        {selectedItem.signature ? (
                                            <img src={selectedItem.signature} className="h-full w-full object-contain" alt="Signature" />
                                        ) : (
                                            <p className="text-gray-300 italic text-xs">No signature record</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-10 rounded-[32px] border border-gray-100">
                            <h4 className="font-black text-gray-900 mb-6">Internal Processing</h4>
                            <textarea 
                                placeholder="Administrative notes for this member..." 
                                value={adminComment} 
                                onChange={(e)=>setAdminComment(e.target.value)}
                                className="w-full p-6 border-0 bg-white rounded-3xl h-32 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm text-sm"
                            />
                            <div className="flex flex-wrap gap-4 justify-end mt-8">
                                <button onClick={()=>handleDownload(selectedItem)} className="px-8 py-3 bg-white border border-gray-200 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all">Download PDF</button>
                                {selectedItem.status !== 'rejected' && (
                                    <button onClick={()=>updateStatus(selectedItem.id!, 'rejected')} disabled={isUpdating} className="px-8 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold hover:bg-red-100 transition-all">Reject</button>
                                )}
                                {selectedItem.status !== 'approved' && (
                                    <button onClick={()=>updateStatus(selectedItem.id!, 'approved')} disabled={isUpdating} className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Approve Member</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
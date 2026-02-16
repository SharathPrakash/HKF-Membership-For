
import React from 'react';
import type { IFormData } from '../types';
import TermsAndConditions from './TermsAndConditions';

const logoHKF = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233B82F6'/%3E%3Ctext x='50' y='62' font-size='40' fill='white' text-anchor='middle' font-family='sans-serif' font-weight='bold'%3EHKF%3C/text%3E%3C/svg%3E";

const getAge = (dobString: string): number => {
    if (!dobString) return 999;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const PrintableView: React.FC<{ formData: IFormData; signatureDataUrl: string | null; hkfId: string | null; containerId?: string }> = ({ formData, signatureDataUrl, hkfId, containerId = "printable-form-content" }) => {
    const PrintableField: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
        <div className="flex flex-row items-start gap-1 py-0.5">
            <p className="w-36 font-semibold text-gray-700 flex-shrink-0">{label}:</p>
            <div className="flex-1 p-1.5 text-sm border rounded-md bg-white text-black min-h-[30px] flex items-center">{value || ''}</div>
        </div>
    );
    
    const getGenderLabel = (value: string) => ({'male': 'Männlich (Male)', 'female': 'Weiblich (Female)'}[value] || '');
    const getStudentLabel = (value: string) => ({'yes': 'Yes', 'no': 'No'}[value] || '');
    const age = getAge(formData.dob);

    return (
        <div id={`${containerId}-wrapper`} style={{ position: 'absolute', left: '-9999px', top: 0, width: '896px', fontSize: '14px' }}>
            <div id={containerId} className="bg-white p-4 sm:p-5">
                <header className="flex flex-col sm:flex-row justify-between items-center pb-2 border-b-2 border-gray-200">
                    <div className="text-center sm:text-left">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Hamburg Kannada Freunde e.V</h1>
                        <p className="text-md text-blue-600 font-semibold">EINTRITTSFORMULAR / Membership Form</p>
                    </div>
                    <img src={logoHKF} alt="Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} className="mt-4 sm:mt-0 flex-shrink-0" />
                </header>
                <main className="pt-3 space-y-3">
                    {hkfId && (
                        <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center justify-center gap-3 mb-6">
                            <span className="text-red-800 font-bold text-sm uppercase">Membership Number:</span>
                            <span className="text-red-600 font-black text-lg tracking-widest">{hkfId}</span>
                        </div>
                    )}
                    <section className="space-y-1.5 p-3 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-1.5">Personal Details</h3>
                        <PrintableField label="First Name" value={formData.firstName} />
                        <PrintableField label="Last Name" value={formData.lastName} />
                        <PrintableField label="Date of Birth" value={formData.dob} />
                        <div className="grid grid-cols-2 gap-x-2">
                             <PrintableField label="Gender" value={getGenderLabel(formData.gender)} />
                             {age < 25 && <PrintableField label="Kannada Shaale?" value={getStudentLabel(formData.isKannadaShaaleStudent)} />}
                        </div>
                        <PrintableField label="Address" value={formData.address} />
                        <div className="grid grid-cols-2 gap-x-2">
                            <PrintableField label="Postal Code" value={formData.postalCode} />
                            <PrintableField label="City" value={formData.city} />
                        </div>
                        <PrintableField label="Phone" value={formData.phone} />
                        <PrintableField label="E-Mail" value={formData.email} />
                    </section>
                    <section className="space-y-2 p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                        <h3 className="text-xl font-bold text-center text-gray-800">SEPA-Lastschriftmandat</h3>
                        <div className="space-y-1.5">
                            <PrintableField label="Holder Name" value={`${formData.sepaFirstName || formData.firstName} ${formData.sepaLastName || formData.lastName}`} />
                            <PrintableField label="IBAN" value={formData.iban} />
                        </div>
                    </section>
                    <section className="space-y-1 p-3 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-1.5">Signature</h3>
                        <div className="flex flex-row items-start gap-1">
                            <div className="w-1/2">
                                <label className="font-semibold text-gray-700 text-xs">Entry Date:</label>
                                <div className="p-2 border rounded bg-gray-50">{formData.entryDate}</div>
                            </div>
                            <div className="flex-1">
                                {signatureDataUrl ? <img src={signatureDataUrl} alt="Signature" className="w-full h-20 border rounded object-contain" /> : <div className="w-full h-20 border rounded"></div>}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
            <div id={`${containerId}-terms`}>
                <TermsAndConditions />
            </div>
        </div>
    );
};

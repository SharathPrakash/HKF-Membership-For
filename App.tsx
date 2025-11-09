import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { IFormData } from './types';
import TermsAndConditions from './components/TermsAndConditions';

// Declare global variables from CDN scripts for TypeScript
declare const jspdf: any;
declare const html2canvas: any;

const initialFormData: IFormData = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: '',
  address: '',
  postalCode: '',
  city: '',
  phone: '',
  email: '',
  entryDate: new Date().toISOString().split('T')[0],
  sepaGender: '',
  sepaFirstName: '',
  sepaLastName: '',
  sepaAddress: '',
  sepaPostalCode: '',
  sepaCity: '',
  iban: '',
  sepaEntryDate: new Date().toISOString().split('T')[0],
};


// A static component to render a filled-out version of the form for PDF generation
const PrintableView: React.FC<{ formData: IFormData; signatureDataUrl: string | null }> = ({ formData, signatureDataUrl }) => {
    
    const PrintableField: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
        <div className="flex flex-row items-start gap-1 py-0.5">
            <p className="w-36 font-semibold text-gray-700 flex-shrink-0">{label}:</p>
            <div className="flex-1 p-1.5 text-sm border rounded-md bg-white text-black min-h-[30px] flex items-center">{value || ''}</div>
        </div>
    );
    
    const getGenderLabel = (value: string) => ({'male': 'Männlich (Male)', 'female': 'Weiblich (Female)'}[value] || '');
    const getSepaGenderLabel = (value: string) => ({'male': 'Male', 'female': 'Female', 'diverse': 'Diverse', 'none': 'No Answer', 'institution': 'Institution'}[value] || '');

    return (
        <div id="printable-container" style={{ position: 'absolute', left: '-9999px', top: 0, width: '896px' /* max-w-4xl */, fontSize: '14px' }}>
            <div id="printable-form-content" className="bg-white p-4 sm:p-5">
                <header className="flex flex-col sm:flex-row justify-between items-center pb-2 border-b-2 border-gray-200">
                    <div className="text-center sm:text-left">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Hamburg Kannada Freunde e.V</h1>
                        <p className="text-md text-blue-600 font-semibold">EINTRITTSFORMULAR / Membership Form</p>
                    </div>
                    <img src="https://picsum.photos/id/111/80/80" alt="Logo" className="w-20 h-20 rounded-full object-cover mt-4 sm:mt-0" />
                </header>

                <main className="pt-3 space-y-3">
                    <section className="space-y-1.5 p-3 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-1.5">Personal Details (Bitte in Druckbuchstaben ausfüllen)</h3>
                        <PrintableField label="First Name (Vorname)" value={formData.firstName} />
                        <PrintableField label="Last Name (Nachname)" value={formData.lastName} />
                        <PrintableField label="Date of Birth (Geburtsdatum)" value={formData.dob} />
                        <PrintableField label="Gender (Geschlecht)" value={getGenderLabel(formData.gender)} />
                        <PrintableField label="Address (Adresse)" value={formData.address} />
                        <div className="grid grid-cols-2 gap-x-2">
                            <PrintableField label="Postal Code" value={formData.postalCode} />
                            <PrintableField label="City (Ort)" value={formData.city} />
                        </div>
                        <PrintableField label="Phone (Tel./Handy)" value={formData.phone} />
                        <PrintableField label="E-Mail" value={formData.email} />
                    </section>

                    <section className="space-y-2 p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                        <h3 className="text-xl font-bold text-center text-gray-800">SEPA-Lastschriftmandat (SEPA Direct Debit Mandate)</h3>
                        <p className="text-xs text-gray-600">Hiermit ermächtige ich den Hamburg Kannada Freunde e.V., den Mitgliedsbeitrag von meinem unten angegebenen Konto per Lastschrift einzuziehen. / I hereby authorize Hamburg Kannada Freunde e.V. to collect the membership fee from my account specified below via direct debit.</p>
                        <div className="space-y-1.5">
                            <PrintableField label="Gender" value={getSepaGenderLabel(formData.sepaGender)} />
                            <PrintableField label="First Name (Vorname)" value={formData.sepaFirstName} />
                            <PrintableField label="Last Name (Nachname)" value={formData.sepaLastName} />
                            <PrintableField label="Address (Adresse)" value={formData.sepaAddress} />
                            <div className="grid grid-cols-2 gap-x-2">
                                <PrintableField label="Postal Code" value={formData.sepaPostalCode} />
                                <PrintableField label="City (Ort)" value={formData.sepaCity} />
                            </div>
                            <PrintableField label="IBAN" value={formData.iban} />
                        </div>
                    </section>
                    
                    <section className="space-y-1 p-3 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-1.5">Signature (Unterschrift)</h3>
                        <div className="flex flex-row items-start gap-1">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-700">Entry Date (Eintrittsdatum):</p>
                                <p className="p-1.5 text-sm">{formData.entryDate}</p>
                            </div>
                            <div className="flex-1">
                                {signatureDataUrl ? 
                                    <img src={signatureDataUrl} alt="Signature" style={{width: '400px', height: '80px', border: '1px solid #d1d5db', borderRadius: '0.375rem', objectFit: 'contain'}}/> 
                                    : <div style={{width: '400px', height: '80px', border: '1px solid #d1d5db', borderRadius: '0.375rem'}}></div>}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Signature should be from the SEPA mandate owner.</p>
                    </section>
                </main>
            </div>
            <div id="printable-terms-container">
                <TermsAndConditions />
            </div>
        </div>
    );
};


const FormField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; error?: string;}> = ({ label, name, value, onChange, placeholder, type = 'text', error }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleIconClick = () => {
        if (inputRef.current?.showPicker) {
            inputRef.current.showPicker();
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-row items-center gap-1">
                <label htmlFor={name} className="w-36 font-semibold text-gray-700 flex-shrink-0">{label}:</label>
                 <div className="relative flex-1 w-full">
                    <input
                        ref={inputRef}
                        id={name}
                        name={name}
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder || label}
                        className={`w-full p-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-black ${error ? 'border-red-500' : 'border-gray-300'} ${type === 'date' ? 'pr-8' : ''}`}
                    />
                    {type === 'date' && (
                        <div onClick={handleIconClick} className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer">
                             <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.5a.5.5 0 000 1h11a.5.5 0 000-1h-11z" clipRule="evenodd" />
                             </svg>
                        </div>
                    )}
                </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1 ml-36 pl-2">{error}</p>}
        </div>
    );
};

const RadioGroup: React.FC<{label: string, name: string, options: {value: string, label: string}[], selectedValue: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, name, options, selectedValue, onChange }) => (
    <div className="flex flex-row items-center gap-1">
        <p className="w-36 font-semibold text-gray-700 flex-shrink-0">{label}:</p>
        <div className="flex-1 flex flex-wrap gap-x-2 gap-y-1">
            {options.map(opt => (
                <label key={opt.value} className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={selectedValue === opt.value}
                        onChange={onChange}
                        className="form-radio h-3.5 w-3.5 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span className="text-gray-900">{opt.label}</span>
                </label>
            ))}
        </div>
    </div>
);


const App: React.FC = () => {
  const [formData, setFormData] = useState<IFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof IFormData, string>>>({});
  const [isSigned, setIsSigned] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [printableSignature, setPrintableSignature] = useState<string | null>(null);

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  
  const validateField = useCallback((name: keyof IFormData, value: string): string => {
    switch (name) {
        case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return 'Please enter a valid email address.';
            }
            break;
        case 'postalCode':
        case 'sepaPostalCode':
            if (value && !/^\d{5}$/.test(value)) {
                return 'Please enter a 5-digit postal code.';
            }
            break;
        case 'iban':
            const sanitizedIban = value.replace(/\s/g, '');
            if (value && !/^DE\d{20}$/.test(sanitizedIban)) {
                return 'Please enter a valid 22-character German IBAN.';
            }
            break;
        default:
            break;
    }
    return '';
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof IFormData; value: string };
    
    let formattedValue = value;
    if (name === 'iban') {
        formattedValue = value.replace(/[^\dA-Z]/gi, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 27);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));

    const error = validateField(name, formattedValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const isCanvasBlank = useCallback((): boolean => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return true;
    const context = canvas.getContext('2d');
    if(!context) return true;
    const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    return !pixelBuffer.some(color => color !== 0);
  }, []);

  useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas || signatureMode !== 'draw') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getPosition = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        e.preventDefault();
        if (e instanceof MouseEvent) {
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return {x: 0, y: 0};
    }

    const startDrawing = (e: MouseEvent | TouchEvent) => {
        isDrawing.current = true;
        const { x, y } = getPosition(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
        if (!isDrawing.current) return;
        const { x, y } = getPosition(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        ctx.closePath();
        setIsSigned(!isCanvasBlank());
    };
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseleave', stopDrawing);
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [signatureMode, isCanvasBlank]);


  useEffect(() => {
    const signatureDrawn = signatureMode === 'draw' && !isCanvasBlank();
    const signatureUploaded = signatureMode === 'upload' && !!uploadedSignature;
    setIsSigned(signatureDrawn || signatureUploaded);
  }, [isCanvasBlank, uploadedSignature, signatureMode]);
  
  const clearSignature = () => {
    if (signatureMode === 'draw') {
        const canvas = signatureCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
    } else {
        setUploadedSignature(null);
    }
    setIsSigned(false);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setUploadedSignature(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please upload a valid image file.");
    }
  };

  const handleDownloadPdf = async () => {
    if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') {
      console.error("PDF generation libraries not loaded.");
      alert("Error: PDF libraries could not be loaded. Please check your internet connection and try again.");
      return;
    }
      
    const formIsValid = (Object.keys(formData) as Array<keyof IFormData>).every(key => !validateField(key, formData[key]));
    if (!formIsValid) {
        alert("Please correct the errors in the form before proceeding.");
        return;
    }
    
    let signatureDataUrl: string | null = null;
    if (signatureMode === 'draw' && !isCanvasBlank()) {
      signatureDataUrl = signatureCanvasRef.current?.toDataURL('image/png') || null;
    } else if (signatureMode === 'upload' && uploadedSignature) {
      signatureDataUrl = uploadedSignature;
    }

    if (!signatureDataUrl) {
      alert("Please provide a signature before generating the PDF.");
      return;
    }
    
    setPrintableSignature(signatureDataUrl);
    setIsGeneratingPdf(true);
    
    // Allow React to render the printable view before capturing
    setTimeout(async () => {
        const formContent = document.getElementById('printable-form-content');
        const termsContent = document.getElementById('printable-terms-container');

        if (!formContent || !termsContent) {
            console.error("Printable content not found.");
            setIsGeneratingPdf(false);
            setPrintableSignature(null);
            return;
        }
        
        try {
            const { jsPDF } = jspdf;
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // --- Process Form Content ---
            const formCanvas = await html2canvas(formContent, { scale: 2, useCORS: true });
            const formImgData = formCanvas.toDataURL('image/png');
            const formImgHeight = (formCanvas.height * pdfWidth) / formCanvas.width;
            
            let formHeightLeft = formImgHeight;
            let position = 0;
            pdf.addImage(formImgData, 'PNG', 0, position, pdfWidth, formImgHeight);
            formHeightLeft -= pageHeight;
            
            while (formHeightLeft > 0) {
                position -= pageHeight;
                pdf.addPage();
                pdf.addImage(formImgData, 'PNG', 0, position, pdfWidth, formImgHeight);
                formHeightLeft -= pageHeight;
            }

            // --- Process Terms Content ---
            pdf.addPage();
            const termsCanvas = await html2canvas(termsContent, { scale: 2, useCORS: true });
            const termsImgData = termsCanvas.toDataURL('image/png');
            const termsImgHeight = (termsCanvas.height * pdfWidth) / termsCanvas.width;

            let termsHeightLeft = termsImgHeight;
            position = 0; // Reset position for the new page
            pdf.addImage(termsImgData, 'PNG', 0, position, pdfWidth, termsImgHeight);
            termsHeightLeft -= pageHeight;

            while (termsHeightLeft > 0) {
                position -= pageHeight;
                pdf.addPage();
                pdf.addImage(termsImgData, 'PNG', 0, position, pdfWidth, termsImgHeight);
                termsHeightLeft -= pageHeight;
            }
    
            pdf.save('HKF_Membership_Application.pdf');
    
        } catch (error) {
          console.error("Error generating PDF:", error);
          alert("Failed to generate PDF. Please try again.");
        } finally {
          setIsGeneratingPdf(false);
          setPrintableSignature(null);
        }
    }, 100);
  };

  return (
    <>
      {isGeneratingPdf && <PrintableView formData={formData} signatureDataUrl={printableSignature} />}
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto text-sm">
          <div id="pdf-content-area">
            <div id="form-to-print" className="bg-white p-4 sm:p-5 rounded-lg shadow-md">
              <header className="flex flex-col sm:flex-row justify-between items-center pb-2 border-b-2 border-gray-200">
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Hamburg Kannada Freunde e.V</h1>
                  <p className="text-md text-blue-600 font-semibold">EINTRITTSFORMULAR / Membership Form</p>
                </div>
                <img src="https://picsum.photos/id/111/80/80" alt="Logo" className="w-20 h-20 rounded-full object-cover mt-4 sm:mt-0" />
              </header>

              <main className="pt-3 space-y-3">
                {/* Personal Details Section */}
                <section className="space-y-1.5 p-3 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-1.5">Personal Details (Bitte in Druckbuchstaben ausfüllen)</h3>
                    <FormField label="First Name (Vorname)" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                    <FormField label="Last Name (Nachname)" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                    <FormField label="Date of Birth (Geburtsdatum)" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                    <RadioGroup label="Gender (Geschlecht)" name="gender" selectedValue={formData.gender} onChange={handleInputChange} options={[{value: 'male', label: 'Männlich (Male)'}, {value: 'female', label: 'Weiblich (Female)'}]} />
                    <FormField label="Address (Adresse)" name="address" value={formData.address} onChange={handleInputChange} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1.5">
                      <FormField label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleInputChange} error={errors.postalCode} />
                      <FormField label="City (Ort)" name="city" value={formData.city} onChange={handleInputChange} />
                    </div>
                    <FormField label="Phone (Tel./Handy)" name="phone" value={formData.phone} onChange={handleInputChange} type="tel" />
                    <FormField label="E-Mail" name="email" value={formData.email} onChange={handleInputChange} type="email" error={errors.email} />
                </section>

                 {/* SEPA Mandate Section */}
                <section className="space-y-2 p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                    <h3 className="text-xl font-bold text-center text-gray-800">SEPA-Lastschriftmandat (SEPA Direct Debit Mandate)</h3>
                    <p className="text-xs text-gray-600">Hiermit ermächtige ich den Hamburg Kannada Freunde e.V., den Mitgliedsbeitrag von meinem unten angegebenen Konto per Lastschrift einzuziehen. / I hereby authorize Hamburg Kannada Freunde e.V. to collect the membership fee from my account specified below via direct debit.</p>
                    <div className="space-y-1.5">
                        <RadioGroup label="Gender" name="sepaGender" selectedValue={formData.sepaGender} onChange={handleInputChange} options={[{value: 'male', label: 'Male'}, {value: 'female', label: 'Female'}, {value: 'diverse', label: 'Diverse'}, {value: 'none', label: 'No Answer'}, {value: 'institution', label: 'Institution'}]} />
                        <FormField label="First Name (Vorname)" name="sepaFirstName" value={formData.sepaFirstName} onChange={handleInputChange} />
                        <FormField label="Last Name (Nachname)" name="sepaLastName" value={formData.sepaLastName} onChange={handleInputChange} />
                        <FormField label="Address (Adresse)" name="sepaAddress" value={formData.sepaAddress} onChange={handleInputChange} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1.5">
                            <FormField label="Postal Code" name="sepaPostalCode" value={formData.sepaPostalCode} onChange={handleInputChange} error={errors.sepaPostalCode} />
                            <FormField label="City (Ort)" name="sepaCity" value={formData.sepaCity} onChange={handleInputChange} />
                        </div>
                        <FormField label="IBAN" name="iban" value={formData.iban} onChange={handleInputChange} placeholder="DE00 0000 0000 0000 0000 00" error={errors.iban} />
                    </div>
                </section>
                
                {/* Signature Section */}
                <section className="space-y-1 p-3 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-1.5">Signature (Unterschrift)</h3>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-1">
                         <div className="w-full sm:w-1/2 flex-1">
                             <p className="font-semibold text-gray-700">Entry Date (Eintrittsdatum):</p>
                             <p className="p-1.5 text-sm">{formData.entryDate}</p>
                         </div>
                        <div className="w-full sm:w-1/2 flex-1">
                            <div className="flex border-b">
                                <button onClick={() => setSignatureMode('draw')} className={`px-4 py-2 text-sm font-semibold w-1/2 rounded-t-lg ${signatureMode === 'draw' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Draw Signature</button>
                                <button onClick={() => setSignatureMode('upload')} className={`px-4 py-2 text-sm font-semibold w-1/2 rounded-t-lg ${signatureMode === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Upload Signature</button>
                            </div>

                            {signatureMode === 'draw' && (
                                <div className="mt-2">
                                    <canvas ref={signatureCanvasRef} width="400" height="80" className="border border-gray-400 rounded-md bg-gray-50 cursor-crosshair w-full"></canvas>
                                </div>
                            )}

                            {signatureMode === 'upload' && (
                                <div className="mt-2 p-4 border border-dashed rounded-md text-center">
                                    <input type="file" id="signature-upload" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                                    <label htmlFor="signature-upload" className="cursor-pointer text-blue-600 hover:underline">Choose an image file</label>
                                    {uploadedSignature && <img src={uploadedSignature} alt="Uploaded Signature" className="mt-2 max-w-full h-auto mx-auto max-h-20 object-contain" />}
                                </div>
                            )}
                            <button type="button" onClick={clearSignature} className="mt-1 text-xs text-blue-600 hover:underline">Clear Signature</button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Signature should be from the SEPA mandate owner.</p>
                </section>
              </main>
            </div>
            
            <div id="terms-and-conditions-container">
                <TermsAndConditions />
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf || !isSigned}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                  {isGeneratingPdf ? (
                      <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating PDF...
                      </>
                  ) : (
                      'Generate and Download PDF'
                  )}
              </button>
               {!isSigned && <p className="text-red-500 text-sm font-semibold">Signature is required to generate PDF.</p>}
          </div>
          
          <footer className="text-center text-xs text-gray-500 mt-6 pb-4">
              <p>Hamburg Kannada Freunde e.V. | Emmi-Ruben-Weg 17B, 21147 Hamburg</p>
              <p>contact@hamburgkannadamitraru.com | www.hamburgkannadamitraru.com</p>
          </footer>

        </div>
      </div>
    </>
  );
};

export default App;
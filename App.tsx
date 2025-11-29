import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { IFormData } from './types';
import TermsAndConditions from './components/TermsAndConditions';
import logoHKF from './logo/HKF-W.png';
//  const logoHKF = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233B82F6'/%3E%3Ctext x='50' y='62' font-size='40' fill='white' text-anchor='middle' font-family='sans-serif' font-weight='bold'%3EHKF%3C/text%3E%3C/svg%3E";

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
                    {/* <img src="https://picsum.photos/id/111/80/80" alt="Logo" className="w-20 h-20 rounded-full object-cover mt-4 sm:mt-0" /> */}
                    <img src={logoHKF} alt="Logo" className="w-20 h-20 rounded-full object-cover mt-4 sm:mt-0" />

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
                            <div className="w-full sm:w-1/2 flex-1 flex flex-col">
                            <label className="font-semibold text-gray-700 mb-2">Entry Date (Eintrittsdatum):</label>
                            <div className="p-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-800 w-1/2">
                                {formData.entryDate}
                            </div>
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


const FormField: React.FC<{ 
    label: string; 
    name: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    placeholder?: string; 
    type?: string; 
    error?: string; 
    required?: boolean; 
}> = ({ label, name, value, onChange, onBlur, placeholder, type = 'text', error, required }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [touched, setTouched] = useState(false);

    const handleIconClick = () => {
        if (inputRef.current?.showPicker) {
            inputRef.current.showPicker();
        }
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setTouched(true);
        if (onBlur) onBlur(e);
    };

    const isSuccess = touched && value && !error;
    const isError = !!error;

    // Determine border color: Red if error, Green if touched and valid (and has value), Gray otherwise
    const borderColor = isError 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
        : isSuccess
            ? 'border-green-500 focus:border-green-500 focus:ring-green-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';

    return (
        <div className="flex flex-col">
            <div className="flex flex-row items-center gap-1">
                <label htmlFor={name} className="w-36 font-semibold text-gray-700 flex-shrink-0">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                 <div className="relative flex-1 w-full">
                    <input
                        ref={inputRef}
                        id={name}
                        name={name}
                        type={type}
                        value={value}
                        onChange={onChange}
                        onBlur={handleBlur}
                        placeholder={placeholder || label}
                        className={`w-full p-1.5 text-sm border rounded-md focus:ring-2 transition bg-white text-black ${borderColor} ${type === 'date' || isSuccess || isError ? 'pr-8' : ''}`}
                    />
                    
                    {/* Date Picker Icon */}
                    {type === 'date' && !isError && !isSuccess && (
                        <div onClick={handleIconClick} className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer">
                             <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.5a.5.5 0 000 1h11a.5.5 0 000-1h-11z" clipRule="evenodd" />
                             </svg>
                        </div>
                    )}
                    
                    {/* Validation Icons */}
                     <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        {isError && (
                             <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {isSuccess && (
                            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1 ml-36 pl-2">{error}</p>}
        </div>
    );
};

const RadioGroup: React.FC<{label: string, name: string, options: {value: string, label: string}[], selectedValue: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, error?: string, required?: boolean}> = ({ label, name, options, selectedValue, onChange, error, required }) => (
    <div className="flex flex-col">
        <div className="flex flex-row items-center gap-1">
            <p className="w-36 font-semibold text-gray-700 flex-shrink-0">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </p>
            <div className={`flex-1 flex flex-wrap gap-x-2 gap-y-1 p-1 rounded-md ${error ? 'outline outline-2 outline-offset-1 outline-red-500' : ''}`}>
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
        {error && <p className="text-red-500 text-xs mt-1 ml-36 pl-2">{error}</p>}
    </div>
);


const App: React.FC = () => {
  const [formData, setFormData] = useState<IFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof IFormData, string>>>({});
  const [isSigned, setIsSigned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isFormCompleteAndValid, setIsFormCompleteAndValid] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [printableSignature, setPrintableSignature] = useState<string | null>(null);

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  
  const validateField = useCallback((name: keyof IFormData, value: string): string => {
    const requiredFields: Array<keyof IFormData> = [
        'firstName', 'lastName', 'dob', 'gender', 'address', 'postalCode', 'city', 'phone', 'email',
        'sepaGender', 'sepaFirstName', 'sepaLastName', 'sepaAddress', 'sepaPostalCode', 'sepaCity', 'iban'
    ];
      
    if (requiredFields.includes(name) && !value.trim()) {
      return 'This field is required.';
    }

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

    // Validate on change to clear errors if they exist
    if (errors[name]) {
        const error = validateField(name, formattedValue);
        setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // New function to handle blur events for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof IFormData; value: string };
    const error = validateField(name, value);
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

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof IFormData, string>> = {};
    const fieldsToValidate: Array<keyof IFormData> = [
        'firstName', 'lastName', 'dob', 'gender', 'address', 'postalCode', 'city', 'phone', 'email',
        'sepaGender', 'sepaFirstName', 'sepaLastName', 'sepaAddress', 'sepaPostalCode', 'sepaCity', 'iban'
    ];

    for (const key of fieldsToValidate) {
        const error = validateField(key, formData[key]);
        if (error) {
            newErrors[key] = error;
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Real-time check for button state without setting errors for the user
  const checkFormValidity = useCallback(() => {
    const fieldsToValidate: Array<keyof IFormData> = [
        'firstName', 'lastName', 'dob', 'gender', 'address', 'postalCode', 'city', 'phone', 'email',
        'sepaGender', 'sepaFirstName', 'sepaLastName', 'sepaAddress', 'sepaPostalCode', 'sepaCity', 'iban'
    ];
    for (const key of fieldsToValidate) {
        if (validateField(key, formData[key])) {
            return false; // Found an error, form is not valid
        }
    }
    return true; // No errors found
  }, [formData, validateField]);

  useEffect(() => {
    setIsFormCompleteAndValid(checkFormValidity());
  }, [formData, checkFormValidity]);


  const handleDownloadPdf = async () => {
    if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') {
      console.error("PDF generation libraries not loaded.");
      alert("Error: PDF libraries could not be loaded. Please check your internet connection and try again.");
      return;
    }
      
    // 1. Run full validation to display all errors to the user.
    if (!validateForm()) {
        setStatusMessage("Please correct the errors highlighted.");
        setTimeout(() => {
            const firstErrorField = document.querySelector('.border-red-500, .outline-red-500');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
        setTimeout(() => setStatusMessage(''), 3000);
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

    setIsProcessing(true);
    
    // Prepare data for submission (sanitize IBAN)
    const submissionData = {
        ...formData,
        iban: formData.iban ? formData.iban.replace(/\s+/g, '') : '',
        signatureDataUrl
    };

    const apiUrl = 'https://hamburgkannadamitraru.com/api/submit-form.php';

    // 2. Save data to the backend
    try {
        setStatusMessage('Saving application to database...');
        console.log('Sending data to:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            mode: 'cors', // Explicitly request CORS
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(submissionData),
        });

        // 3. Robust Response Handling
        let responseText = await response.text();
        responseText = responseText.trim(); // Remove whitespace/BOM
        console.log('Raw Server Response:', responseText);

        try {
            // Try to parse JSON response
            const jsonResponse = JSON.parse(responseText);
            if (!response.ok || (jsonResponse.status && jsonResponse.status !== 'success')) {
                throw new Error(jsonResponse.message || 'Failed to save form data.');
            }
        } catch (e) {
            // If parsing fails or response is not OK
            if (e instanceof SyntaxError) {
                // Strip HTML tags to show a readable error message
                const cleanText = responseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                const shortText = cleanText.substring(0, 300);
                
                // Check if it looks like an HTML page
                if (responseText.toLowerCase().startsWith('<!doctype html') || responseText.toLowerCase().includes('<html')) {
                    throw new Error(`Server returned a webpage instead of a JSON response. The API URL might be wrong or the server is showing an error page.\n\nServer Message: "${shortText}..."`);
                }
                
                throw new Error(`Server returned an invalid response (not JSON). Please check the server logs.\n\nResponse snippet: "${shortText}"`);
            }
            throw e; 
        }

        // Data saved successfully, now generate PDF
        setStatusMessage('Data saved successfully! Generating PDF...');

    } catch (error) {
        console.error("Submission Error:", error);
        let errorMessage = 'An unknown error occurred while saving the application.';
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            errorMessage = 'Connection failed. This is likely a CORS issue (your PHP backend is blocking the connection from Vercel) or the API URL is incorrect. Please check your server headers.';
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        alert(`Could not save your application.\n\n${errorMessage}`);
        setIsProcessing(false);
        setStatusMessage('');
        return; // Stop the process if saving fails
    }
    
    // 4. Generate PDF
    setPrintableSignature(signatureDataUrl);
    
    // Allow React to render the printable view before capturing
    setTimeout(async () => {
        const formContent = document.getElementById('printable-form-content');
        const termsContent = document.getElementById('printable-terms-container');

        if (!formContent || !termsContent) {
            console.error("Printable content not found.");
            setIsProcessing(false);
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
          setIsProcessing(false);
          setStatusMessage('');
          setPrintableSignature(null);
        }
    }, 100);
  };

  return (
    <>
      {isProcessing && <PrintableView formData={formData} signatureDataUrl={printableSignature} />}
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto text-sm">
          <div id="pdf-content-area">
            <div id="form-to-print" className="bg-white p-4 sm:p-5 rounded-lg shadow-md">
              <header className="flex flex-col sm:flex-row justify-between items-center pb-2 border-b-2 border-gray-200">
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Hamburg Kannada Freunde e.V</h1>
                  <p className="text-md text-blue-600 font-semibold">EINTRITTSFORMULAR / Membership Form</p>
                </div>
                {/* <img src="https://picsum.photos/id/111/80/80" alt="Logo" className="w-20 h-20 rounded-full object-cover mt-4 sm:mt-0" /> */}
                <img src={logoHKF} alt="Logo" className="w-20 h-20 rounded-full object-cover mt-4 sm:mt-0" />
              </header>

              <main className="pt-3 space-y-3">
                {/* Personal Details Section */}
                <section className="space-y-1.5 p-3 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-1.5">Personal Details (Bitte in Druckbuchstaben ausfüllen)</h3>
                    <FormField label="First Name (Vorname)" name="firstName" value={formData.firstName} onChange={handleInputChange} onBlur={handleBlur} error={errors.firstName} required />
                    <FormField label="Last Name (Nachname)" name="lastName" value={formData.lastName} onChange={handleInputChange} onBlur={handleBlur} error={errors.lastName} required />
                    <FormField label="Date of Birth (Geburtsdatum)" name="dob" type="date" value={formData.dob} onChange={handleInputChange} onBlur={handleBlur} error={errors.dob} required />
                    <RadioGroup label="Gender (Geschlecht)" name="gender" selectedValue={formData.gender} onChange={handleInputChange} options={[{value: 'male', label: 'Männlich (Male)'}, {value: 'female', label: 'Weiblich (Female)'}]} error={errors.gender} required />
                    <FormField label="Address (Adresse)" name="address" value={formData.address} onChange={handleInputChange} onBlur={handleBlur} error={errors.address} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1.5">
                      <FormField label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleInputChange} onBlur={handleBlur} error={errors.postalCode} required />
                      <FormField label="City (Ort)" name="city" value={formData.city} onChange={handleInputChange} onBlur={handleBlur} error={errors.city} required />
                    </div>
                    <FormField label="Phone (Tel./Handy)" name="phone" value={formData.phone} onChange={handleInputChange} onBlur={handleBlur} type="tel" error={errors.phone} required />
                    <FormField label="E-Mail" name="email" value={formData.email} onChange={handleInputChange} onBlur={handleBlur} type="email" error={errors.email} required />
                </section>

                 {/* SEPA Mandate Section */}
                <section className="space-y-2 p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                    <h3 className="text-xl font-bold text-center text-gray-800">SEPA-Lastschriftmandat (SEPA Direct Debit Mandate)</h3>
                    <p className="text-xs text-gray-600">Hiermit ermächtige ich den Hamburg Kannada Freunde e.V., den Mitgliedsbeitrag von meinem unten angegebenen Konto per Lastschrift einzuziehen. / I hereby authorize Hamburg Kannada Freunde e.V. to collect the membership fee from my account specified below via direct debit.</p>
                    <div className="space-y-1.5">
                        <RadioGroup label="Gender" name="sepaGender" selectedValue={formData.sepaGender} onChange={handleInputChange} options={[{value: 'male', label: 'Male'}, {value: 'female', 'label': 'Female'}, {value: 'diverse', label: 'Diverse'}, {value: 'none', label: 'No Answer'}, {value: 'institution', label: 'Institution'}]} error={errors.sepaGender} required />
                        <FormField label="First Name (Vorname)" name="sepaFirstName" value={formData.sepaFirstName} onChange={handleInputChange} onBlur={handleBlur} error={errors.sepaFirstName} required />
                        <FormField label="Last Name (Nachname)" name="sepaLastName" value={formData.sepaLastName} onChange={handleInputChange} onBlur={handleBlur} error={errors.sepaLastName} required />
                        <FormField label="Address (Adresse)" name="sepaAddress" value={formData.sepaAddress} onChange={handleInputChange} onBlur={handleBlur} error={errors.sepaAddress} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1.5">
                            <FormField label="Postal Code" name="sepaPostalCode" value={formData.sepaPostalCode} onChange={handleInputChange} onBlur={handleBlur} error={errors.sepaPostalCode} required />
                            <FormField label="City (Ort)" name="sepaCity" value={formData.sepaCity} onChange={handleInputChange} onBlur={handleBlur} error={errors.sepaCity} required />
                        </div>
                        <FormField label="IBAN" name="iban" value={formData.iban} onChange={handleInputChange} onBlur={handleBlur} placeholder="DE00 0000 0000 0000 0000 00" error={errors.iban} required />
                    </div>
                </section>
                
                {/* Signature Section */}
                <section className="space-y-1 p-3 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-1.5">Signature (Unterschrift)<span className="text-red-500 ml-1">*</span></h3>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-1">
                        <div className="w-full sm:w-1/2 flex-1 flex flex-col">
                            <label className="font-semibold text-gray-700 mb-2">Entry Date (Eintrittsdatum):</label>
                             <div className="p-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-800 w-1/2">
                                {formData.entryDate}
                            </div>
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
                  disabled={isProcessing || !isSigned || !isFormCompleteAndValid}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                  {isProcessing ? (
                      <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {statusMessage || 'Processing...'}
                      </>
                  ) : (
                      'Save Application & Download PDF'
                  )}
              </button>
              {!isProcessing && (!isFormCompleteAndValid || !isSigned) && (
                  <p className="text-red-500 text-sm font-semibold">
                      {!isFormCompleteAndValid
                          ? "Please complete all required fields to enable."
                          : "A signature is required to enable."
                      }
                  </p>
              )}
          </div>
          
        <footer className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-700">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">Contact</h4>
                    <address className="not-italic mt-2 space-y-1 text-gray-600">
                        <div className="font-medium text-gray-700">Hamburg Kannada Freunde e.V.</div>
                        <div>Emmi-Ruben-Weg 17B, 21147 Hamburg</div>
                        <div>
                            Email:{" "}
                            <a
                                href="mailto:contact@hamburgkannadamitraru.com"
                                className="text-blue-600 hover:underline"
                            >
                                contact@hamburgkannadamitraru.com
                            </a>
                        </div>
                        <div>
                            Website:{" "}
                            <a
                                href="https://www.hamburgkannadamitraru.com"
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                www.hamburgkannadamitraru.com
                            </a>
                        </div>
                    </address>
                </div>

                <div className="flex-2 min-w-0">
                    <h4 className="font-semibold text-gray-800">Bank Details</h4>
                    <div className="mt-2 space-y-1 text-gray-600">
                        <div className="font-medium text-gray-700">Hamburger Sparkasse (HASPA)</div>
                        <div>
                            IBAN: <span className="font-mono bg-gray-50 px-2 py-0.5 rounded text-sm">DE73 2005 0550 1506 4113 37</span>
                        </div>
                        <div>
                            BIC: <span className="font-mono bg-gray-50 px-2 py-0.5 rounded text-sm">HASPDEHHXXX</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mt-4 text-center text-xs text-gray-400">
                © {new Date().getFullYear()} Hamburg Kannada Freunde e.V.
            </div>
        </footer>

 {/* <footer className="text-center text-xs text-gray-500 mt-6 pb-4">
              <p>Hamburg Kannada Freunde e.V. | Emmi-Ruben-Weg 17B, 21147 Hamburg</p>
              <p>contact@hamburgkannadamitraru.com | www.hamburgkannadamitraru.com</p>
          </footer> */}

        </div>
      </div>
    </>
  );
};

export default App;
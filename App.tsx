
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { IFormData } from './types';
import TermsAndConditions from './components/TermsAndConditions';
import { PrintableView } from './components/PrintableView';
import AdminDashboard from './AdminDashboard';
import logoHKF from './logo/HKF-W.png';
// const logoHKF = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233B82F6'/%3E%3Ctext x='50' y='62' font-size='40' fill='white' text-anchor='middle' font-family='sans-serif' font-weight='bold'%3EHKF%3C/text%3E%3C/svg%3E";

declare const jspdf: any;
declare const html2canvas: any;

const initialFormData: IFormData = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: '',
  isKannadaShaaleStudent: '',
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
                    {type === 'date' && !isError && !isSuccess && (
                        <div onClick={handleIconClick} className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer">
                             <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.5a.5.5 0 000 1h11a.5.5 0 000-1h-11z" clipRule="evenodd" />
                             </svg>
                        </div>
                    )}
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

const RadioGroup: React.FC<{label: string, name: string, options: {value: string, label: string}[], selectedValue: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, error?: string, required?: boolean, disabled?: boolean}> = ({ label, name, options, selectedValue, onChange, error, required, disabled }) => (
    <div className="flex flex-col">
        <div className="flex flex-row items-center gap-1">
            <p className={`w-36 font-semibold flex-shrink-0 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                {label}
                {required && !disabled && <span className="text-red-500 ml-1">*</span>}
            </p>
            <div className={`flex-1 flex flex-wrap gap-x-2 gap-y-1 p-1 rounded-md ${error && !disabled ? 'outline outline-2 outline-offset-1 outline-red-500' : ''}`}>
                {options.map(opt => (
                    <label key={opt.value} className={`flex items-center space-x-1.5 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input
                            type="radio"
                            name={name}
                            value={opt.value}
                            checked={selectedValue === opt.value}
                            onChange={onChange}
                            disabled={disabled}
                            className="form-radio h-3.5 w-3.5 text-blue-600 transition duration-150 ease-in-out"
                        />
                        <span className={`${disabled ? 'text-gray-400' : 'text-gray-900'}`}>{opt.label}</span>
                    </label>
                ))}
            </div>
        </div>
        {error && !disabled && <p className="text-red-500 text-xs mt-1 ml-36 pl-2">{error}</p>}
    </div>
);

const MembershipForm: React.FC = () => {
  const [formData, setFormData] = useState<IFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof IFormData, string>>>({});
  const [isSigned, setIsSigned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isFormCompleteAndValid, setIsFormCompleteAndValid] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [printableSignature, setPrintableSignature] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);
  
  const [isSaved, setIsSaved] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isSavingBackend, setIsSavingBackend] = useState(false);
  const [finalSignatureUrl, setFinalSignatureUrl] = useState<string | null>(null);
  const [receivedHkfId, setReceivedHkfId] = useState<string | null>(null);

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  
  const validateField = useCallback((name: keyof IFormData, value: string, currentFormData?: IFormData): string => {
    const data = currentFormData || formData;
    const requiredFields: Array<keyof IFormData> = [
        'firstName', 'lastName', 'dob', 'gender', 'address', 'postalCode', 'city', 'phone', 'email',
        'sepaGender', 'sepaFirstName', 'sepaLastName', 'sepaAddress', 'sepaPostalCode', 'sepaCity', 'iban'
    ];
      
    if (requiredFields.includes(name) && !value.trim()) {
      return 'This field is required.';
    }

    if (name === 'isKannadaShaaleStudent') {
        const age = getAge(data.dob);
        if (age < 25 && !value) {
            return 'Required for students/children.';
        }
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
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as { name: keyof IFormData; value: string };
    
    let formattedValue = value;
    if (name === 'iban') {
        formattedValue = value.replace(/[^\dA-Z]/gi, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 27);
    }
    
    const updatedFormData = { ...formData, [name]: formattedValue };
    setFormData(updatedFormData);
    
    setIsSaved(false);
    setHasDownloaded(false);
    setPdfDownloadUrl(null); 
    setShowSuccessPopup(false);
    setReceivedHkfId(null);

    if (errors[name]) {
        const error = validateField(name, formattedValue, updatedFormData);
        setErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  
  useEffect(() => {
      const age = getAge(formData.dob);
      if (age >= 25 && formData.isKannadaShaaleStudent) {
          setFormData(prev => ({...prev, isKannadaShaaleStudent: ''}));
          setErrors(prev => ({...prev, isKannadaShaaleStudent: ''}));
      }
  }, [formData.dob, formData.isKannadaShaaleStudent]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as { name: keyof IFormData; value: string };
    const error = validateField(name, value, formData);
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
        setIsSaved(false);
        setHasDownloaded(false);
        setReceivedHkfId(null);
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
          if (ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); }
        }
    } else {
        setUploadedSignature(null);
    }
    setIsSigned(false);
    setIsSaved(false);
    setHasDownloaded(false);
    setReceivedHkfId(null);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setUploadedSignature(event.target?.result as string);
            setIsSaved(false);
            setHasDownloaded(false);
            setReceivedHkfId(null);
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please upload a valid image file.");
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof IFormData, string>> = {};
    const fieldsToValidate: Array<keyof IFormData> = [
        'firstName', 'lastName', 'dob', 'gender', 'isKannadaShaaleStudent', 'address', 'postalCode', 'city', 'phone', 'email',
        'sepaGender', 'sepaFirstName', 'sepaLastName', 'sepaAddress', 'sepaPostalCode', 'sepaCity', 'iban'
    ];
    for (const key of fieldsToValidate) {
        const error = validateField(key, formData[key], formData);
        if (error) { newErrors[key] = error; }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const checkFormValidity = useCallback(() => {
    const fieldsToValidate: Array<keyof IFormData> = [
        'firstName', 'lastName', 'dob', 'gender', 'isKannadaShaaleStudent', 'address', 'postalCode', 'city', 'phone', 'email',
        'sepaGender', 'sepaFirstName', 'sepaLastName', 'sepaAddress', 'sepaPostalCode', 'sepaCity', 'iban'
    ];
    for (const key of fieldsToValidate) {
        if (validateField(key, formData[key], formData)) { return false; }
    }
    return true;
  }, [formData, validateField]);

  useEffect(() => {
    setIsFormCompleteAndValid(checkFormValidity());
  }, [formData, checkFormValidity]);

  const generatePdfBlob = async (): Promise<string | null> => {
      return new Promise((resolve) => {
          setTimeout(async () => {
                const formContent = document.getElementById('printable-form-content');
                const termsContent = document.getElementById('printable-terms-container');
                if (!formContent || !termsContent) {
                    console.error("Printable content not found.");
                    resolve(null);
                    return;
                }
                try {
                    const pdf = new jspdf({ orientation: 'p', unit: 'mm', format: 'a4' });
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();
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
                    pdf.addPage();
                    const termsCanvas = await html2canvas(termsContent, { scale: 2, useCORS: true });
                    const termsImgData = termsCanvas.toDataURL('image/png');
                    const termsImgHeight = (termsCanvas.height * pdfWidth) / termsCanvas.width;
                    let termsHeightLeft = termsImgHeight;
                    position = 0;
                    pdf.addImage(termsImgData, 'PNG', 0, position, pdfWidth, termsImgHeight);
                    termsHeightLeft -= pageHeight;
                    while (termsHeightLeft > 0) {
                        position -= pageHeight;
                        pdf.addPage();
                        pdf.addImage(termsImgData, 'PNG', 0, position, pdfWidth, termsImgHeight);
                        termsHeightLeft -= pageHeight;
                    }
                    const blob = pdf.output('blob');
                    resolve(URL.createObjectURL(blob));
                } catch (error) {
                  console.error("Error generating PDF:", error);
                  resolve(null);
                }
          }, 100);
      });
  };

  const handleGeneratePdf = async () => {
    if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') {
      alert("Error: PDF libraries could not be loaded.");
      return;
    }
    if (!validateForm()) {
        setStatusMessage("Please correct the errors highlighted.");
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
      alert("Please provide a signature.");
      return;
    }
    setFinalSignatureUrl(signatureDataUrl);
    setPrintableSignature(signatureDataUrl);
    setReceivedHkfId(null);
    setIsProcessing(true);
    setPdfDownloadUrl(null); 
    setHasDownloaded(false);
    setStatusMessage('Generating PDF...');
    try {
        const blobUrl = await generatePdfBlob();
        if (blobUrl) {
            setPdfDownloadUrl(blobUrl);
            setShowSuccessPopup(true);
        }
    } finally {
        setIsProcessing(false);
        setStatusMessage('');
    }
  };
  
  const saveDataToBackend = async (): Promise<string | null> => {
      setIsSavingBackend(true);
      const submissionData = {
        ...formData,
        iban: formData.iban ? formData.iban.replace(/\s+/g, '') : '',
        signatureDataUrl: finalSignatureUrl
      };
      try {
        const response = await fetch('./api/submit-form.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
        });
        const jsonResponse = await response.json();
        if (!response.ok || !jsonResponse.success) {
            throw new Error(String(jsonResponse.message || 'Failed to save form data.'));
        }
        setIsSaved(true);
        // Ensure hkfId is explicitly returned as a string to satisfy potential strict type checks.
        return jsonResponse.hkfId ? String(jsonResponse.hkfId) : "SAVED_NO_ID";
    } catch (error: any) {
        alert(`Could not save application: ${String(error.message)}`);
        return null;
    } finally {
        setIsSavingBackend(false);
    }
  };

  const handlePopupAction = async (action: 'download' | 'email') => {
      let currentDownloadUrl: string | null = pdfDownloadUrl;
      if (!isSaved) {
          const hkfId = await saveDataToBackend();
          if (!hkfId) return; 
          if (hkfId !== "SAVED_NO_ID") {
              // Fix for line 374: Explicitly cast hkfId to string to prevent string|number ambiguity.
              setReceivedHkfId(String(hkfId));
              await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
              const newBlobUrl = await generatePdfBlob();
              if (newBlobUrl) {
                  currentDownloadUrl = newBlobUrl;
                  setPdfDownloadUrl(newBlobUrl);
              }
          }
      }
      if (action === 'download' && currentDownloadUrl) {
          const link = document.createElement('a');
          link.href = String(currentDownloadUrl);
          // Standardize receivedHkfId as a string for inclusion in file name.
          link.download = `HKF_Membership_${String(receivedHkfId || 'Application')}.pdf`;
          link.click();
          setHasDownloaded(true);
      } else if (action === 'email') {
          // Fix for line 387: Cast subject and body to string to ensure type safety with encodeURIComponent.
          const subject = String(`Membership Application - ${formData.firstName} ${formData.lastName}`);
          const body = String(`Dear HKF Team,\n\n>>> PLEASE ATTACH THE DOWNLOADED MEMBERSHIP FORM HERE <<<\n\nPlease find attached my signed membership application form.\n\nRegards,\n${formData.firstName} ${formData.lastName}`);
          window.location.href = `mailto:contact@hamburgkannadamitraru.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
  };

  return (
    <>
      {isProcessing && <PrintableView formData={formData} signatureDataUrl={printableSignature} hkfId={receivedHkfId} />}
      {!isProcessing && showSuccessPopup && <PrintableView formData={formData} signatureDataUrl={printableSignature} hkfId={receivedHkfId} />}

      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto text-sm">
          <div id="pdf-content-area">
            <div id="form-to-print" className="bg-white p-4 sm:p-5 rounded-lg shadow-md">
              <header className="flex flex-col sm:flex-row justify-between items-center pb-2 border-b-2 border-gray-200">
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Hamburg Kannada Freunde e.V</h1>
                  <p className="text-md text-blue-600 font-semibold">EINTRITTSFORMULAR / Membership Form</p>
                </div>
                <img src={logoHKF} alt="Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} className="mt-4 sm:mt-0 flex-shrink-0" />
              </header>

              <main className="pt-3 space-y-3">
                <section className="space-y-1.5 p-3 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-1.5">Personal Details (Bitte in Druckbuchstaben ausfüllen)</h3>
                    <FormField label="First Name (Vorname)" name="firstName" value={formData.firstName} onChange={handleInputChange} onBlur={handleBlur} error={errors.firstName} required />
                    <FormField label="Last Name (Nachname)" name="lastName" value={formData.lastName} onChange={handleInputChange} onBlur={handleBlur} error={errors.lastName} required />
                    <FormField label="Date of Birth (Geburtsdatum)" name="dob" type="date" value={formData.dob} onChange={handleInputChange} onBlur={handleBlur} error={errors.dob} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1.5">
                        <RadioGroup label="Gender (Geschlecht)" name="gender" selectedValue={formData.gender} onChange={handleInputChange} options={[{value: 'male', label: 'Männlich (Male)'}, {value: 'female', label: 'Weiblich (Female)'}]} error={errors.gender} required />
                         <RadioGroup label="Enrolled in Kannada Shaale?" name="isKannadaShaaleStudent" selectedValue={formData.isKannadaShaaleStudent} onChange={handleInputChange} options={[{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}]} error={errors.isKannadaShaaleStudent} required={getAge(formData.dob) < 25} disabled={getAge(formData.dob) >= 25} />
                    </div>
                    <FormField label="Address (Adresse)" name="address" value={formData.address} onChange={handleInputChange} onBlur={handleBlur} error={errors.address} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1.5">
                      <FormField label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleInputChange} onBlur={handleBlur} error={errors.postalCode} required />
                      <FormField label="City (Ort)" name="city" value={formData.city} onChange={handleInputChange} onBlur={handleBlur} error={errors.city} required />
                    </div>
                    <FormField label="Phone (Tel./Handy)" name="phone" value={formData.phone} onChange={handleInputChange} onBlur={handleBlur} type="tel" error={errors.phone} required />
                    <FormField label="E-Mail" name="email" value={formData.email} onChange={handleInputChange} onBlur={handleBlur} type="email" error={errors.email} required />
                </section>
                <section className="space-y-2 p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                    <h3 className="text-xl font-bold text-center text-gray-800">SEPA Direct Debit Mandate</h3>
                    <p className="text-xs text-gray-600">Hiermit ermächtige ich den Hamburg Kannada Freunde e.V., den Mitgliedsbeitrag von meinem unten angegebenen Konto per Lastschrift einzuziehen.</p>
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
                <section className="space-y-1 p-3 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-1.5">Signature (Unterschrift)<span className="text-red-500 ml-1">*</span></h3>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-1">
                        <div className="w-full sm:w-1/2 flex-1 flex flex-col">
                            <label className="font-semibold text-gray-700 mb-2 text-sm">Entry Date:</label>
                             <div className="p-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-800 w-1/2">
                                {formData.entryDate}
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2 flex-1">
                            <div className="flex border-b">
                                <button onClick={() => setSignatureMode('draw')} className={`px-4 py-2 text-sm font-semibold w-1/2 rounded-t-lg transition ${signatureMode === 'draw' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Draw</button>
                                <button onClick={() => setSignatureMode('upload')} className={`px-4 py-2 text-sm font-semibold w-1/2 rounded-t-lg transition ${signatureMode === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Upload</button>
                            </div>
                            {signatureMode === 'draw' ? (
                                <div className="mt-2"><canvas ref={signatureCanvasRef} width="400" height="80" className="border border-gray-400 rounded-md bg-gray-50 cursor-crosshair w-full"></canvas></div>
                            ) : (
                                <div className="mt-2 p-4 border border-dashed rounded-md text-center">
                                    <input type="file" id="signature-upload" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                                    <label htmlFor="signature-upload" className="cursor-pointer text-blue-600 hover:underline">Choose an image</label>
                                    {uploadedSignature && <img src={uploadedSignature} alt="Uploaded" className="mt-2 max-w-full h-auto mx-auto max-h-20 object-contain" />}
                                </div>
                            )}
                            <button type="button" onClick={clearSignature} className="mt-1 text-xs text-blue-600 hover:underline">Clear</button>
                        </div>
                    </div>
                </section>
              </main>
            </div>
            <div id="terms-and-conditions-container"><TermsAndConditions /></div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                  onClick={handleGeneratePdf}
                  disabled={isProcessing || !isSigned || !isFormCompleteAndValid}
                  className="w-full sm:w-auto px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                  {isProcessing ? statusMessage || 'Processing...' : 'Generate Membership Application'}
              </button>
          </div>
        <footer className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-700">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">Contact</h4>
                    <address className="not-italic mt-2 space-y-1 text-gray-600">
                        <div>Hamburg Kannada Freunde e.V.</div>
                        <div>Emmi-Ruben-Weg 17B, 21147 Hamburg</div>
                        <div>Email: <a href="mailto:contact@hamburgkannadamitraru.com" className="text-blue-600 hover:underline">contact@hamburgkannadamitraru.com</a></div>
                    </address>
                </div>
            </div>
            {/* <div className="max-w-4xl mx-auto mt-8 text-center text-xs text-gray-300">
                © {new Date().getFullYear()} Hamburg Kannada Freunde e.V. | <a href="#/admin" className="hover:text-blue-400 transition">Admin Dashboard</a>
            </div> */}
            <div className="max-w-4xl mx-auto mt-4 text-center text-xs text-gray-400">
                © {new Date().getFullYear()} Hamburg Kannada Freunde e.V.
            </div>
        </footer>
        {showSuccessPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-10 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                        <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Form Generated!</h3>
                    <p className="text-gray-500 text-sm mb-10">You must download and email the signed PDF to complete your membership.</p>
                    <div className="flex flex-col gap-4">
                        <button onClick={() => handlePopupAction('download')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition">1. Save & Download PDF</button>
                        <button onClick={() => handlePopupAction('email')} disabled={!hasDownloaded} className="w-full border-2 border-blue-600 text-blue-600 py-4 rounded-2xl font-bold disabled:opacity-30 transition">2. Send Email to HKF Team</button>
                        <button onClick={() => setShowSuccessPopup(false)} className="text-gray-400 text-sm hover:text-gray-600 mt-2">Close</button>
                    </div>
                </div>
            </div>
        )}
        </div>
      </div>
    </>
  );
};

const App: React.FC = () => {
    const [route, setRoute] = useState(window.location.hash || '#/');

    useEffect(() => {
        const handleHashChange = () => setRoute(window.location.hash || '#/');
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (route === '#/admin') {
        return <AdminDashboard />;
    }

    return <MembershipForm />;
};

export default App;

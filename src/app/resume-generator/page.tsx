'use client';

import React, { useState, useEffect } from 'react';
import {
    Download,
    Sparkles,
    FileText,
    Briefcase,
    GraduationCap,
    User,
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Github,
    Loader2
} from 'lucide-react';

interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
}

interface Experience {
    id: number;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    responsibilities: string[];
}

interface Education {
    id: number;
    institution: string;
    degree: string;
    field: string;
    graduationYear: string;
    gpa: string;
}

interface Skills {
    technical: string[];
    soft: string[];
}

interface ResumeData {
    personal: PersonalInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: Skills;
    projects: unknown[];
    references: unknown[];
}

interface SavedResume {
    id: number;
    name: string;
    data: ResumeData;
    template: string;
    lastModified: string;
    createdAt: string;
}

interface Template {
    primaryColor: string;
    secondaryColor: string;
    font: string;
}


export default function ResumeGeneratorPage() {
    // ==========================================
    // STATE MANAGEMENT
    // ==========================================
    const [activeTab, setActiveTab] = useState('personal');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [template, setTemplate] = useState('modern');
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showPDFModal, setShowPDFModal] = useState(false);
    const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [savedResumes, setSavedResumes] = useState([]);
    const [currentResumeName, setCurrentResumeName] = useState('');
    const [newSkill, setNewSkill] = useState({ technical: '', soft: '' });

    const [resumeData, setResumeData] = useState({
        personal: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            github: '',
            portfolio: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: {
            technical: [],
            soft: []
        },
        projects: [],
        references: []
    });

    // ==========================================
    // PART 2: useEffect & BASIC FUNCTIONS
    // ==========================================

    // Load API key and saved resumes on mount
    useEffect(() => {
        const savedKey = localStorage.getItem('anthropicApiKey');
        const style = document.createElement('style');

        if (savedKey) {
            setApiKey(savedKey);
        }
        loadSavedResumesList();
        style.textContent = `
    /* Fix input text visibility */
    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="url"],
    textarea,
    select {
      color: #1e293b !important;
      background-color: white !important;
    }
    
    input::placeholder,
    textarea::placeholder {
      color: #94a3b8 !important;
    }
    
    input:focus,
    textarea:focus {
      color: #0f172a !important;
    }
  `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const loadSavedResumesList = () => {
        const saved = localStorage.getItem('savedResumes');
        if (saved) {
            setSavedResumes(JSON.parse(saved));
        }
    };

    const saveApiKey = (key: string) => {
        localStorage.setItem('anthropicApiKey', key);
        setApiKey(key);
        setShowAPIKeyModal(false);
        alert('API Key saved securely in your browser!');
    };

    const removeApiKey = () => {
        localStorage.removeItem('anthropicApiKey');
        setApiKey('');
        alert('API Key removed from your browser.');
    };

    const createNewResume = () => {
        const hasData = resumeData.personal.fullName ||
            resumeData.summary ||
            resumeData.experience.length > 0 ||
            resumeData.education.length > 0 ||
            resumeData.skills.technical.length > 0 ||
            resumeData.skills.soft.length > 0;

        if (hasData) {
            setShowNewModal(true);
        } else {
            resetResume();
        }
    };

    const resetResume = () => {
        setResumeData({
            personal: {
                fullName: '',
                email: '',
                phone: '',
                location: '',
                linkedin: '',
                github: '',
                portfolio: ''
            },
            summary: '',
            experience: [],
            education: [],
            skills: {
                technical: [],
                soft: []
            },
            projects: [],
            references: []
        });
        setCurrentResumeName('');
        setTemplate('modern');
        setShowNewModal(false);
    };

    const downloadPDF = () => {
        setShowPDFModal(true);
    };

    const templates = {
        modern: {
            primaryColor: '#2563eb',
            secondaryColor: '#1e293b',
            font: 'Inter, system-ui, sans-serif'
        },
        classic: {
            primaryColor: '#1f2937',
            secondaryColor: '#4b5563',
            font: 'Georgia, serif'
        },
        creative: {
            primaryColor: '#7c3aed',
            secondaryColor: '#ec4899',
            font: 'Poppins, sans-serif'
        }
    };

    const currentTemplate = templates[template];

    const updatePersonal = (field: string, value: string) => {
        setResumeData(prev => ({
            ...prev,
            personal: { ...prev.personal, [field]: value }
        }));
    };

    // Experience Management
    const addExperience = () => {
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, {
                id: Date.now(),
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                current: false,
                responsibilities: ['']
            }]
        }));
    };

    const updateExperience = (id: number, field: string, value: string | boolean) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }));
    };
    const addResponsibility = (expId: number) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === expId ? { ...exp, responsibilities: [...exp.responsibilities, ''] } : exp
            )
        }));
    };

    const updateResponsibility = (expId: number, index: number, value: string) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === expId ? {
                    ...exp,
                    responsibilities: exp.responsibilities.map((resp, i) => i === index ? value : resp)
                } : exp
            )
        }));
    };

    const removeExperience = (id: number) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }));
    };

    // Education Management
    const addEducation = () => {
        setResumeData(prev => ({
            ...prev,
            education: [...prev.education, {
                id: Date.now(),
                institution: '',
                degree: '',
                field: '',
                graduationYear: '',
                gpa: ''
            }]
        }));
    };

    const updateEducation = (id: number, field: string, value: string) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        }));
    };

    const removeEducation = (id: number) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    };

    // Skills Management
    const addSkill = (type: 'technical' | 'soft') => {
        if (newSkill[type].trim()) {
            setResumeData(prev => ({
                ...prev,
                skills: {
                    ...prev.skills,
                    [type]: [...prev.skills[type], newSkill[type].trim()]
                }
            }));
            setNewSkill(prev => ({ ...prev, [type]: '' }));
        }
    };

    const removeSkill = (type: 'technical' | 'soft', index: number) => {
        setResumeData(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                [type]: prev.skills[type].filter((_, i) => i !== index)
            }
        }));
    };

    // Save/Load Resume Management
    const saveResume = (name: string) => {
        if (!name.trim()) {
            alert('Please enter a name for your resume');
            return;
        }

        const resumeToSave: SavedResume = {
            id: Date.now(),
            name: name.trim(),
            data: resumeData,
            template: template,
            lastModified: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        const existing = localStorage.getItem('savedResumes');
        const resumes: SavedResume[] = existing ? JSON.parse(existing) : [];

        const existingIndex = resumes.findIndex((r: SavedResume) => r.name === name.trim());
        if (existingIndex >= 0) {
            resumes[existingIndex] = { ...resumes[existingIndex], ...resumeToSave, createdAt: resumes[existingIndex].createdAt };
        } else {
            resumes.push(resumeToSave);
        }

        localStorage.setItem('savedResumes', JSON.stringify(resumes));
        setSavedResumes(resumes);
        setCurrentResumeName(name.trim());
        setShowSaveModal(false);
        alert(`Resume "${name}" saved successfully!`);
    };
    const loadResume = (resume: SavedResume) => {
        setResumeData(resume.data);
        setTemplate(resume.template as 'modern' | 'classic' | 'creative');
        setCurrentResumeName(resume.name);
        setShowLoadModal(false);
        alert(`Resume "${resume.name}" loaded successfully!`);
    };


   const deleteResume = (id: number) => {
  const resumes = savedResumes.filter((r: SavedResume) => r.id !== id);
  localStorage.setItem('savedResumes', JSON.stringify(resumes));
  setSavedResumes(resumes);
};

    // ==========================================
    // PART 4: AI ENHANCEMENT FUNCTIONS
    // ==========================================


    // ==========================================
    // AI FUNCTIONS - NOW USING API ROUTE (NO CORS ISSUES!)
    // ==========================================

    const generateSummary = async () => {
  if (!apiKey) {
    setShowAPIKeyModal(true);
    return;
  }

  setIsEnhancing(true);
  try {
    const experienceSummary = resumeData.experience.map(exp => 
      `${exp.position} at ${exp.company}`
    ).join(', ');
    
    const skillsSummary = [...resumeData.skills.technical, ...resumeData.skills.soft].join(', ');

    const prompt = experienceSummary || skillsSummary 
      ? `Write a compelling professional summary (3-4 sentences) for a resume based on:

Experience: ${experienceSummary || 'Entry level professional'}
Skills: ${skillsSummary || 'Motivated learner'}

Make it achievement-focused, professional, and impactful. Return only the summary.`
      : `Write a compelling professional summary (3-4 sentences) for an entry-level professional resume. Make it achievement-focused, professional, and impactful. Return only the summary.`;

    const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        prompt,
        maxTokens: 200
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    const summary = data.content[0].text.trim();
    setResumeData(prev => ({ ...prev, summary }));
    alert('Summary generated successfully!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Summary generation error:', error);
    alert(`Failed to generate summary: ${errorMessage}`);
  } finally {
    setIsEnhancing(false);
  }
};

const enhanceWithAI = async (expId: number, respIndex: number) => {
  if (!apiKey) {
    setShowAPIKeyModal(true);
    return;
  }

  setIsEnhancing(true);
  const experience = resumeData.experience.find(exp => exp.id === expId);
  if (!experience) {
    setIsEnhancing(false);
    return;
  }
  
  const responsibility = experience.responsibilities[respIndex];

  if (!responsibility || responsibility.trim() === '') {
    alert('Please enter some text before enhancing.');
    setIsEnhancing(false);
    return;
  }

  try {
    const prompt = `Transform this job responsibility into a compelling achievement statement with metrics and impact. Keep it under 20 words, start with an action verb, and make it quantifiable:

"${responsibility}"

Return only the enhanced statement, nothing else.`;

    const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        prompt,
        maxTokens: 150
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to enhance text');
    }

    const data = await response.json();
    const enhanced = data.content[0].text.trim();
    updateResponsibility(expId, respIndex, enhanced);
    alert('Text enhanced successfully!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Enhancement error:', error);
    alert(`Failed to enhance: ${errorMessage}`);
  } finally {
    setIsEnhancing(false);
  }
};

    // ==========================================
    // PART 5: IMPORT/EXPORT FUNCTIONS
    // ==========================================

    const exportJSON = () => {
        const dataStr = JSON.stringify(resumeData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resume-${resumeData.personal.fullName.replace(/\s+/g, '-').toLowerCase() || 'data'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    try {
      const result = e.target?.result;
      if (typeof result === 'string') {
        const imported: ResumeData = JSON.parse(result);
        setResumeData(imported);
        alert('Resume data imported successfully!');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error importing JSON file. Please make sure it\'s a valid resume JSON file.');
      console.error('Import error:', errorMessage);
    }
  };
  reader.readAsText(file);
};

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .resume-preview, .resume-preview * {
            visibility: visible;
          }
          .resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 no-print">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">ECH Resume Generator</h1>
                                <p className="text-slate-600">
                                    {currentResumeName ? `Editing: ${currentResumeName}` : 'Create your professional resume in minutes'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setShowAPIKeyModal(true)}
                                className={`px-4 py-2 ${apiKey ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'} text-white rounded-lg flex items-center gap-2`}
                                title={apiKey ? 'API Key configured' : 'Configure API Key'}
                            >
                                <Sparkles className="w-4 h-4" />
                                {apiKey ? '🔑 AI Ready' : '⚠️ Setup AI'}
                            </button>
                            <button
                                onClick={createNewResume}
                                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                New
                            </button>
                            <button
                                onClick={() => setShowSaveModal(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <Download className="w-4 h-4 rotate-180" />
                                Save
                            </button>
                            <button
                                onClick={() => setShowLoadModal(true)}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Load ({savedResumes.length})
                            </button>
                            <input
                                type="file"
                                accept=".json"
                                onChange={importJSON}
                                className="hidden"
                                id="json-import"
                            />
                            <label
                                htmlFor="json-import"
                                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2 cursor-pointer"
                            >
                                <Download className="w-4 h-4 rotate-180" />
                                Import
                            </label>
                            <button
                                onClick={exportJSON}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Export
                            </button>
                            <select
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="modern">Modern</option>
                                <option value="classic">Classic</option>
                                <option value="creative">Creative</option>
                            </select>
                            <button
                                onClick={downloadPDF}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* API Key Setup Modal */}
                {showAPIKeyModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
                            <h3 className="text-xl font-bold mb-4">🔑 Configure AI Features</h3>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-800 mb-2">
                                    <strong>To use AI enhancement features, you need an Anthropic API key.</strong>
                                </p>
                                <p className="text-sm text-blue-700">
                                    Your API key is stored <strong>only in your browser</strong> and never sent to any server except Anthropic's API.
                                </p>
                            </div>

                            <div className="mb-4">
                                <h4 className="font-semibold text-slate-900 mb-2">How to get your API key:</h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                                    <li>Go to <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a></li>
                                    <li>Sign up or log in</li>
                                    <li>Navigate to "API Keys" section</li>
                                    <li>Click "Create Key" and copy it</li>
                                    <li>Paste it below</li>
                                </ol>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Anthropic API Key
                                </label>
                                <input
                                    type="password"
                                    defaultValue={apiKey}
                                    placeholder="sk-ant-api03-..."
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    id="api-key-input"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    💡 Your key stays in your browser only - 100% private & secure
                                </p>
                            </div>

                            {apiKey && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        ✅ API Key is currently configured
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowAPIKeyModal(false)}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                                >
                                    Cancel
                                </button>
                                {apiKey && (
                                    <button
                                        onClick={removeApiKey}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Remove Key
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('api-key-input');
                                        if (input.value.trim()) {
                                            saveApiKey(input.value.trim());
                                        } else {
                                            alert('Please enter a valid API key');
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Save API Key
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Resume Modal */}
                {showSaveModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">Save Resume</h3>
                            <p className="text-slate-600 mb-4">Give your resume a name to save it locally</p>
                            <input
                                type="text"
                                defaultValue={currentResumeName}
                                placeholder="e.g., Software Engineer Resume"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        saveResume(e.target.value);
                                    }
                                }}
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={(e) => {
                                        const input = e.target.parentElement.previousElementSibling;
                                        saveResume(input.value);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Save Resume
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* New Resume Confirmation Modal */}
                {showNewModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">⚠️ Create New Resume?</h3>
                            <p className="text-slate-600 mb-4">
                                This will clear all current data. Any unsaved changes will be lost.
                            </p>
                            <p className="text-sm text-slate-500 mb-4">
                                💡 Tip: Click "Save" first to keep your current resume before creating a new one.
                            </p>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowNewModal(false)}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={resetResume}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Yes, Create New
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PDF Export Modal */}
                {showPDFModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">📄 Export as PDF</h3>
                            <p className="text-slate-600 mb-4">
                                To save your resume as PDF:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
                                <li>Press <kbd className="px-2 py-1 bg-slate-100 rounded">Ctrl + P</kbd> (Windows/Linux) or <kbd className="px-2 py-1 bg-slate-100 rounded">Cmd + P</kbd> (Mac)</li>
                                <li>Select "Save as PDF" as the destination</li>
                                <li>Click "Save"</li>
                            </ol>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-800">
                                    💡 <strong>Tip:</strong> Only the resume preview will be printed, not the editor panel!
                                </p>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowPDFModal(false)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Got it!
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Load Resume Modal */}
                {showLoadModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-4">Load Resume</h3>
                            {savedResumes.length === 0 ? (
                                <p className="text-slate-600 py-8 text-center">No saved resumes yet. Create and save your first resume!</p>
                            ) : (
                                <div className="space-y-3">
                                    {savedResumes.map(resume => (
                                        <div key={resume.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-500 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900">{resume.name}</h4>
                                                    <p className="text-sm text-slate-600">
                                                        Last modified: {new Date(resume.lastModified).toLocaleDateString()} at {new Date(resume.lastModified).toLocaleTimeString()}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {resume.data.personal.fullName} • {resume.data.experience.length} experiences • {resume.data.education.length} education
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        onClick={() => loadResume(resume)}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                                    >
                                                        Load
                                                    </button>
                                                    <button
                                                        onClick={() => deleteResume(resume.id, resume.name)}
                                                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowLoadModal(false)}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Editor Panel */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 no-print">
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {[
                                { id: 'personal', icon: User, label: 'Personal' },
                                { id: 'summary', icon: FileText, label: 'Summary' },
                                { id: 'experience', icon: Briefcase, label: 'Experience' },
                                { id: 'education', icon: GraduationCap, label: 'Education' },
                                { id: 'skills', icon: Sparkles, label: 'Skills' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {/* Personal Info */}
                            {activeTab === 'personal' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={resumeData.personal.fullName}
                                            onChange={(e) => updatePersonal('fullName', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={resumeData.personal.email}
                                                onChange={(e) => updatePersonal('email', e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                value={resumeData.personal.phone}
                                                onChange={(e) => updatePersonal('phone', e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={resumeData.personal.location}
                                            onChange={(e) => updatePersonal('location', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="New York, NY"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
                                        <input
                                            type="url"
                                            value={resumeData.personal.linkedin}
                                            onChange={(e) => updatePersonal('linkedin', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="linkedin.com/in/johndoe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">GitHub</label>
                                        <input
                                            type="url"
                                            value={resumeData.personal.github}
                                            onChange={(e) => updatePersonal('github', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="github.com/johndoe"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            {activeTab === 'summary' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-slate-700">Professional Summary</label>
                                        <button
                                            onClick={generateSummary}
                                            disabled={isEnhancing}
                                            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm disabled:opacity-50"
                                        >
                                            {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            Generate with AI
                                        </button>
                                    </div>
                                    <textarea
                                        value={resumeData.summary}
                                        onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                                        placeholder="A brief overview of your professional background and career goals..."
                                    />
                                </div>
                            )}

                            {/* Experience */}
                            {activeTab === 'experience' && (
                                <div className="space-y-4">
                                    {resumeData.experience.map((exp, expIndex) => (
                                        <div key={exp.id} className="p-4 bg-slate-50 rounded-lg space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-slate-900">Experience #{expIndex + 1}</h3>
                                                <button
                                                    onClick={() => removeExperience(exp.id)}
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={exp.company}
                                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Company Name"
                                            />
                                            <input
                                                type="text"
                                                value={exp.position}
                                                onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Job Title"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={exp.startDate}
                                                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Start Date (e.g., Jan 2020)"
                                                />
                                                <input
                                                    type="text"
                                                    value={exp.endDate}
                                                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="End Date (or 'Present')"
                                                    disabled={exp.current}
                                                />
                                            </div>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={exp.current}
                                                    onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                                    className="rounded"
                                                />
                                                <span className="text-sm text-slate-700">Currently working here</span>
                                            </label>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-slate-700">Responsibilities</label>
                                                {exp.responsibilities.map((resp, respIndex) => (
                                                    <div key={respIndex} className="flex gap-2">
                                                        <textarea
                                                            value={resp}
                                                            onChange={(e) => updateResponsibility(exp.id, respIndex, e.target.value)}
                                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Describe your achievement or responsibility..."
                                                            rows="2"
                                                        />
                                                        <button
                                                            onClick={() => enhanceWithAI(exp.id, respIndex)}
                                                            disabled={isEnhancing || !resp}
                                                            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                                            title="Enhance with AI"
                                                        >
                                                            {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => addResponsibility(exp.id)}
                                                    className="text-sm text-blue-600 hover:text-blue-700"
                                                >
                                                    + Add Responsibility
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addExperience}
                                        className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                    >
                                        + Add Experience
                                    </button>
                                </div>
                            )}

                            {/* Education */}
                            {activeTab === 'education' && (
                                <div className="space-y-4">
                                    {resumeData.education.map((edu, index) => (
                                        <div key={edu.id} className="p-4 bg-slate-50 rounded-lg space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-slate-900">Education #{index + 1}</h3>
                                                <button
                                                    onClick={() => removeEducation(edu.id)}
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={edu.institution}
                                                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Institution Name"
                                            />
                                            <input
                                                type="text"
                                                value={edu.degree}
                                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Degree (e.g., Bachelor of Science)"
                                            />
                                            <input
                                                type="text"
                                                value={edu.field}
                                                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Field of Study"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={edu.graduationYear}
                                                    onChange={(e) => updateEducation(edu.id, 'graduationYear', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Graduation Year"
                                                />
                                                <input
                                                    type="text"
                                                    value={edu.gpa}
                                                    onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="GPA (optional)"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addEducation}
                                        className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                    >
                                        + Add Education
                                    </button>
                                </div>
                            )}

                            {/* Skills */}
                            {activeTab === 'skills' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-3">Technical Skills</label>
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={newSkill.technical}
                                                onChange={(e) => setNewSkill(prev => ({ ...prev, technical: e.target.value }))}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addSkill('technical');
                                                    }
                                                }}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., JavaScript, React, Python..."
                                            />
                                            <button
                                                onClick={() => addSkill('technical')}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {resumeData.skills.technical.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-2"
                                                >
                                                    {skill}
                                                    <button
                                                        onClick={() => removeSkill('technical', index)}
                                                        className="text-blue-600 hover:text-blue-800 font-bold"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-3">Soft Skills</label>
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={newSkill.soft}
                                                onChange={(e) => setNewSkill(prev => ({ ...prev, soft: e.target.value }))}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addSkill('soft');
                                                    }
                                                }}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Leadership, Communication..."
                                            />
                                            <button
                                                onClick={() => addSkill('soft')}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {resumeData.skills.soft.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center gap-2"
                                                >
                                                    {skill}
                                                    <button
                                                        onClick={() => removeSkill('soft', index)}
                                                        className="text-purple-600 hover:text-purple-800 font-bold"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 resume-preview" style={{ fontFamily: currentTemplate.font }}>
                        <div className="max-w-[210mm] mx-auto bg-white">
                            {/* Header */}
                            <div className="text-center mb-6 pb-6 border-b-2" style={{ borderColor: currentTemplate.primaryColor }}>
                                <h1 className="text-3xl font-bold mb-2" style={{ color: currentTemplate.primaryColor }}>
                                    {resumeData.personal.fullName || 'Your Name'}
                                </h1>
                                <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-600">
                                    {resumeData.personal.email && (
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {resumeData.personal.email}
                                        </span>
                                    )}
                                    {resumeData.personal.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {resumeData.personal.phone}
                                        </span>
                                    )}
                                    {resumeData.personal.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {resumeData.personal.location}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 text-sm mt-2">
                                    {resumeData.personal.linkedin && (
                                        <span className="flex items-center gap-1 text-blue-600">
                                            <Linkedin className="w-3 h-3" />
                                            LinkedIn
                                        </span>
                                    )}
                                    {resumeData.personal.github && (
                                        <span className="flex items-center gap-1 text-slate-700">
                                            <Github className="w-3 h-3" />
                                            GitHub
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Summary */}
                            {resumeData.summary && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold mb-2" style={{ color: currentTemplate.primaryColor }}>
                                        Professional Summary
                                    </h2>
                                    <p className="text-slate-700 leading-relaxed">{resumeData.summary}</p>
                                </div>
                            )}

                            {/* Experience */}
                            {resumeData.experience.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold mb-3" style={{ color: currentTemplate.primaryColor }}>
                                        Experience
                                    </h2>
                                    <div className="space-y-4">
                                        {resumeData.experience.map(exp => (
                                            <div key={exp.id}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">{exp.position || 'Position'}</h3>
                                                        <p className="text-slate-600">{exp.company || 'Company'}</p>
                                                    </div>
                                                    <span className="text-sm text-slate-500">
                                                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                                    </span>
                                                </div>
                                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                                                    {exp.responsibilities.filter(r => r).map((resp, idx) => (
                                                        <li key={idx}>{resp}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {resumeData.education.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold mb-3" style={{ color: currentTemplate.primaryColor }}>
                                        Education
                                    </h2>
                                    <div className="space-y-3">
                                        {resumeData.education.map(edu => (
                                            <div key={edu.id}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">
                                                            {edu.degree || 'Degree'} {edu.field && `in ${edu.field}`}
                                                        </h3>
                                                        <p className="text-slate-600">{edu.institution || 'Institution'}</p>
                                                    </div>
                                                    <div className="text-right text-sm text-slate-500">
                                                        {edu.graduationYear && <div>{edu.graduationYear}</div>}
                                                        {edu.gpa && <div>GPA: {edu.gpa}</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills */}
                            {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold mb-3" style={{ color: currentTemplate.primaryColor }}>
                                        Skills
                                    </h2>
                                    {resumeData.skills.technical.length > 0 && (
                                        <div className="mb-2">
                                            <span className="font-semibold text-slate-700">Technical: </span>
                                            <span className="text-slate-600">{resumeData.skills.technical.join(', ')}</span>
                                        </div>
                                    )}
                                    {resumeData.skills.soft.length > 0 && (
                                        <div>
                                            <span className="font-semibold text-slate-700">Soft Skills: </span>
                                            <span className="text-slate-600">{resumeData.skills.soft.join(', ')}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


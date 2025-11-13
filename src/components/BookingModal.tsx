import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Event } from '@/types/event';
import api from '@/lib/api';
import { loadRazorpay, createRazorpayOrder, verifyRazorpayPayment } from '@/lib/razorpay';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequirements: string;
    address?: string;
    city?: string;
    postalCode?: string;
    deliveryInstructions?: string;
}

interface BookingModalProps {
    event: Event;
    isOpen: boolean;
    onClose: () => void;
}

export function BookingModal({ event, isOpen, onClose }: BookingModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialRequirements: '',
        address: '',
        city: '',
        postalCode: '',
        deliveryInstructions: ''
    });
    const [loading, setLoading] = useState(false);
    const [paymentChoice, setPaymentChoice] = useState<'now' | 'later' | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhone = (phone: string) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        return cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone);
    };

    const validateForm = () => {
        const errors: {[key: string]: string} = {};

        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'WhatsApp number is required';
        } else if (!validatePhone(formData.phone)) {
            errors.phone = 'Please enter a valid 10-digit WhatsApp number (starting with 6-9)';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Format phone number (remove non-digits and limit to 10 digits)
        if (name === 'phone') {
            const cleanPhone = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormData(prev => ({
                ...prev,
                [name]: cleanPhone
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleEnrollment = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);

            // For testing: Mock successful enrollment
            setTimeout(() => {
                setEnrollmentId('mock_enrollment_123');
                setStep(2); // Always show payment choice step
                setLoading(false);
            }, 1000);

        } catch (error: any) {
            console.error('Enrollment error:', error);
            setErrorMessage(
                error.response?.data?.error ||
                'There was an error processing your enrollment. Please try again.'
            );
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            specialRequirements: '',
            address: '',
            city: '',
            postalCode: '',
            deliveryInstructions: ''
        });
        setPaymentChoice(null);
        setErrorMessage(null);
        setValidationErrors({});
        setEnrollmentId(null);
        setLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        resetForm();
        onClose();
    };

    const handlePayment = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            console.log(paymentChoice, 'Payment choice selected');

            if (paymentChoice === 'later') {
                // For pay later, save to pay later table
                const payLaterData = {
                    full_name: `${formData.firstName} ${formData.lastName}`,
                    email_address: formData.email,
                    phone_number: formData.phone,
                    payment_method: 'Pay Later',
                    questions_or_comments: formData.specialRequirements || '',
                    courses_or_workshops: `${event.title} - Date: ${event.event_date} - Price: ₹${event.amount} - event_type: ${event.event_type}`
                };

                console.log('🚀 Saving Pay Later request:', payLaterData);
                console.log('📡 Making request to:', `${api.defaults.baseURL}/api/paylater`);

                try {
                    const response = await api.post('/api/paylater', payLaterData);
                    
                    if (response.data.success || response.status === 201) {
                        console.log('✅ Pay later record created successfully');
                        setShowSuccessModal(true);
                    } else {
                        console.error('❌ API responded but not successful:', response.data);
                        setErrorMessage('Unable to save your pay later request. Please try again.');
                    }
                } catch (apiError: any) {
                    console.error('❌ Pay Later API call failed:', apiError);
                    setErrorMessage(
                        apiError.response?.data?.error || 
                        `Network error: ${apiError.message}. Please check if the server is running.`
                    );
                }
                return;
            }

            if (paymentChoice === 'now') {
                // For pay now, process Razorpay payment
                console.log('� Initiating Razorpay payment for amount:', event.amount);
                
                const enrollmentData = {
                    full_name: `${formData.firstName} ${formData.lastName}`,
                    email_address: formData.email,
                    phone_number: formData.phone,
                    payment_method: 'Razorpay - Paid',
                    questions_or_comments: formData.specialRequirements || '',
                    courses_or_workshops: `${event.title} - Date: ${event.event_date} - Price: ₹${event.amount} - event_type: ${event.event_type}`
                };

                try {
                    // Create Razorpay order with course details for email notification
                    const orderResponse = await createRazorpayOrder({
                        amount: parseFloat(event.amount?.toString() || '0'),
                        currency: 'INR',
                        receipt: `receipt_${Date.now()}`,
                        notes: {
                            event_title: event.title,
                            event_date: event.event_date,
                            student_name: enrollmentData.full_name
                        },
                        courseDetails: enrollmentData // Add course details for email
                    });

                    if (!orderResponse.success) {
                        throw new Error('Failed to create payment order');
                    }

                    console.log('✅ Razorpay order created:', orderResponse.order.id);

                    // Load Razorpay script
                    const Razorpay = await loadRazorpay();

                    const options = {
                        key: orderResponse.key,
                        order_id: orderResponse.order.id,
                        amount: orderResponse.order.amount,
                        currency: orderResponse.order.currency,
                        name: 'Flower School Bengaluru',
                        description: `Payment for ${event.title}`,
                        image: '/logo.png', // Add your logo here
                        prefill: {
                            name: enrollmentData.full_name,
                            email: enrollmentData.email_address,
                            contact: enrollmentData.phone_number
                        },
                        theme: {
                            color: '#ec4899' // Pink color to match your theme
                        },
                        config: {
                            display: {
                                hide: [
                                    {
                                        method: 'emi'
                                    }
                                ]
                            }
                        },
                        handler: async (response: any) => {
                            try {
                                console.log('🎉 Payment successful:', response.razorpay_payment_id);
                                
                                // Verify payment and save enrollment
                                const verificationResponse = await verifyRazorpayPayment({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    enrollment_data: enrollmentData
                                });

                                if (verificationResponse.success) {
                                    console.log('✅ Payment verified and enrollment saved');
                                    setShowSuccessModal(true);
                                } else {
                                    throw new Error('Payment verification failed');
                                }
                            } catch (verificationError) {
                                console.error('❌ Payment verification error:', verificationError);
                                setErrorMessage('Payment was successful but verification failed. Please contact support.');
                            } finally {
                                setLoading(false);
                            }
                        },
                        modal: {
                            ondismiss: () => {
                                console.log('💸 Payment cancelled by user');
                                setLoading(false);
                                setErrorMessage('Payment was cancelled. Please try again.');
                            }
                        }
                    };

                    const razorpayInstance = new Razorpay(options);
                    razorpayInstance.open();

                } catch (paymentError: any) {
                    console.error('❌ Payment initiation error:', paymentError);
                    setErrorMessage(
                        paymentError.message || 'Failed to initiate payment. Please try again.'
                    );
                    setLoading(false);
                }
                return;
            }

        } catch (error: any) {
            console.error('Payment error:', error);
            setErrorMessage(
                error.response?.data?.error ||
                'There was an error processing your payment. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-[95vw] mx-2 sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] sm:max-h-[95vh] overflow-y-auto rounded-lg sm:rounded-xl">
                    <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                        <DialogTitle className="text-lg sm:text-xl font-bold text-center sm:text-left">
                            {event.event_type === 'Course' ? 'Enroll in Course' : 
                             event.event_type === 'Workshop' ? 'Register for Workshop' : 
                             'Book Event'}: {event.title}
                        </DialogTitle>
                        <DialogDescription className="text-sm sm:text-base text-center sm:text-left">
                            {step === 1 
                                ? `${event.event_date} ${event.event_time ? `at ${event.event_time}` : ''} - Fill out the form below to reserve your spot`
                                : `${event.event_date} ${event.event_time ? `at ${event.event_time}` : ''} - Choose your preferred payment option`
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {errorMessage && (
                        <div className="mx-4 sm:mx-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm">
                            {errorMessage}
                        </div>
                    )}

                    {step === 1 ? (
                        // Step 1: Registration Form
                        <>
                            <div className="space-y-4 py-2 sm:py-4 px-4 sm:px-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="Enter your first name"
                                            className={`h-10 sm:h-11 text-sm sm:text-base ${validationErrors.firstName ? 'border-red-500' : ''}`}
                                        />
                                        {validationErrors.firstName && (
                                            <p className="text-red-500 text-xs">{validationErrors.firstName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Enter your last name"
                                            className={`h-10 sm:h-11 text-sm sm:text-base ${validationErrors.lastName ? 'border-red-500' : ''}`}
                                        />
                                        {validationErrors.lastName && (
                                            <p className="text-red-500 text-xs">{validationErrors.lastName}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email address"
                                        className={`h-10 sm:h-11 text-sm sm:text-base ${validationErrors.email ? 'border-red-500' : ''}`}
                                    />
                                    {validationErrors.email && (
                                        <p className="text-red-500 text-xs">{validationErrors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium">WhatsApp Number *</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter 10-digit mobile number"
                                        className={`h-10 sm:h-11 text-sm sm:text-base ${validationErrors.phone ? 'border-red-500' : ''}`}
                                    />
                                    {validationErrors.phone && (
                                        <p className="text-red-500 text-xs">{validationErrors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specialRequirements" className="text-sm font-medium">Special Requirements (Optional)</Label>
                                    <textarea
                                        id="specialRequirements"
                                        name="specialRequirements"
                                        value={formData.specialRequirements}
                                        onChange={handleInputChange}
                                        placeholder="Any special requirements or dietary restrictions..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-vertical text-sm sm:text-base"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
                                <Button 
                                    variant="outline" 
                                    onClick={handleClose} 
                                    className="w-full sm:w-auto border-pink-600 text-pink-600 hover:bg-pink-50 h-10 sm:h-11 text-sm sm:text-base"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (validateForm()) {
                                            handleEnrollment();
                                        }
                                    }}
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 h-10 sm:h-11 text-sm sm:text-base"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                            Processing...
                                        </span>
                                    ) : (
                                        event.event_type === 'Course' ? 'Enroll Now' : 
                                        event.event_type === 'Workshop' ? 'Register Now' : 
                                        'Book Now'
                                    )}
                                </Button>
                            </DialogFooter>
                        </>
                    ) : step === 2 ? (
                        // Step 2: Payment Choice
                        <>
                            <div className="space-y-4 sm:space-y-6 py-2 sm:py-4 px-4 sm:px-6">
                                <div className="text-center space-y-2">
                                    <h4 className="font-medium text-base sm:text-lg text-green-600">
                                        ✅ {event.event_type === 'Course' ? 'Enrollment Registered!' : 
                                            event.event_type === 'Workshop' ? 'Registration Complete!' : 
                                            'Booking Registered!'}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Your spot has been reserved. Choose your payment option:
                                    </p>
                                </div>

                                {/* Course/Workshop Details */}
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4">
                                    <h5 className="font-medium text-sm sm:text-base mb-2">{event.event_type} Details</h5>
                                    <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                                        <p><span className="font-medium">Title:</span> {event.title}</p>
                                        <p><span className="font-medium">Date:</span> {event.event_date}</p>
                                        {event.event_time && <p><span className="font-medium">Time:</span> {event.event_time}</p>}
                                        <p><span className="font-medium">Fee:</span> ₹{event.amount || 0}</p>
                                        <p><span className="font-medium">Student:</span> {formData.firstName} {formData.lastName}</p>
                                    </div>
                                </div>

                                {/* Payment Options */}
                                <div className="space-y-3 sm:space-y-4">
                                    <h4 className="font-medium text-base sm:text-lg text-center sm:text-left">Choose Payment Option</h4>
                                    
                                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                        <Button
                                            variant="outline"
                                            className="h-16 sm:h-20 border-2 border-orange-300 hover:border-orange-400 hover:bg-orange-50 py-2"
                                            onClick={() => {
                                                setPaymentChoice('later');
                                                handlePayment();
                                            }}
                                            disabled={loading}
                                        >
                                            <div className="text-center w-full">
                                                <div className="font-medium text-orange-600 text-sm sm:text-base">Pay Later</div>
                                                <div className="text-xs text-muted-foreground mt-1 px-2">
                                                  We will contact you shortly to finalize payment details
                                                </div>
                                            </div>
                                        </Button>
                                        <Button
                                            className="h-16 sm:h-20 bg-green-600 hover:bg-green-700 py-2"
                                            onClick={() => {
                                                setPaymentChoice('now');
                                                handlePayment();
                                            }}
                                            disabled={loading}
                                        >
                                            <div className="text-center text-white w-full">
                                                <div className="font-medium text-sm sm:text-base">Pay Now</div>
                                                <div className="text-xs mt-1 px-2">Complete payment online securely</div>
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="max-w-[90vw] sm:max-w-md mx-2 rounded-lg sm:rounded-xl">
                    <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                        <DialogTitle className="text-center text-green-600 text-lg sm:text-xl">
                            🎉 Success!
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm sm:text-base">
                            {paymentChoice === 'later' 
                                ? 'Your enrollment has been registered successfully with pay later option.'
                                : 'Your enrollment has been completed successfully.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="text-center space-y-3 sm:space-y-4 py-3 sm:py-4 px-4 sm:px-6">
                        <p className="text-base sm:text-lg font-medium">
                            {paymentChoice === 'later' 
                                ? 'Your spot has been reserved!'
                                : 'Payment completed successfully!'
                            }
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {paymentChoice === 'later' 
                                ? 'You can pay at the venue. We\'ll send you a confirmation message shortly.'
                                : 'Thank you for your payment. You\'ll receive a confirmation shortly.'
                            }
                        </p>
                    </div>
                    <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <Button 
                            onClick={handleSuccessClose} 
                            className="w-full h-10 sm:h-11 text-sm sm:text-base"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
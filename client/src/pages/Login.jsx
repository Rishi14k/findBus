import { Bus } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { googleLoginApi, requestOtpApi, verifyOtpApi } from '../api/auth.api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { connectSocket } from '../socket';


const PRIMARY_COLOR = "#123D87";
const Login = () => {
    const [step, setStep] = useState("email"); 
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate()

   useEffect(() => {
     const loadGoogleScript = () => {
       return new Promise((resolve) => {
         if (window.google) return resolve();

         const script = document.createElement("script");
         script.src = "https://accounts.google.com/gsi/client";
         script.async = true;
         script.defer = true;
         script.onload = resolve;
         document.body.appendChild(script);
       });
     };

     loadGoogleScript().then(() => {
       window.google.accounts.id.initialize({
         client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
         callback: async (response) => {
           try {
             setIsLoading(true);
             const res = await googleLoginApi(response.credential);
             localStorage.setItem("token", res.data.token);
              localStorage.setItem("user", JSON.stringify(res.data.user));
             toast.success("Login successful!");
             navigate("/");
           } catch (error) {
             toast.error("Google login failed");
           } finally {
             setIsLoading(false);
           }
         },
       });

       window.google.accounts.id.renderButton(
         document.getElementById("googleBtn"),
         {theme: "outline", size: "large", width: "100%"},
       );
     });
   }, []);


     const handleEmailSubmit = async (e) => {
       e.preventDefault();
       if (!email) return;

       try {
         setIsLoading(true);
         await requestOtpApi(email);
         toast.success("OTP sent to your email");
         setStep("otp");
       } catch (error) {
         toast.error(error.response?.data?.message || "Error sending OTP");
       } finally {
         setIsLoading(false);
       }
     };


     const handleOtpSubmit = async (e) => {
       e.preventDefault();

       try {
         setIsLoading(true);
         const res = await verifyOtpApi(email, otp);

         localStorage.setItem("token", res.data.token);
         localStorage.setItem("user", JSON.stringify(res.data.user));
         toast.success("Login successful!");
         connectSocket();
         
         const role = res.data.user.role;

         if (role === "admin") {
           navigate("/admin/dashboard");
         } else if (role === "driver") {
           navigate("/driver/dashboard");
         } else {
           navigate("/");
         }

       } catch (error) {
         toast.error(error.response?.data?.message || "Invalid or expired OTP");
       } finally {
         setIsLoading(false);
       }
     };

     const handleResendOtp = async () => {
       try {
         setIsLoading(true);
         await requestOtpApi(email);
         toast.success("OTP resent");
       } catch (error) {
         toast.error("Failed to resend OTP");
       } finally {
         setIsLoading(false);
       }
     };


     const handleGoogleLogin = async (idToken) => {
       setIsLoading(true);
       try {
         const res = await googleLoginApi(idToken);
         localStorage.setItem("token",res.data.token)
         localStorage.setItem("user", JSON.stringify(res.data.user));
         toast.success("Login successfully!")
       } catch (error) {
        toast.error("Login failed")
        console.log(error)
        setIsLoading(false)
       }finally{
        setIsLoading(false)
       }
     };
  return (
    <div>
      <div className="min-h-screen bg-[#BBE0EF] flex flex-col justify-center items-center p-10 font-sans">
        <div className="w-full max-w-md bg-white border-1 rounded-2xl shadow-xl overflow-hidden">
          <div
            className="h-32 flex items-center justify-center"
            style={{backgroundColor: PRIMARY_COLOR}}
          >
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <Bus className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              {step === "email" ? "Welcome Back" : "Verify Identity"}
            </h2>
            <p className="text-gray-500 text-center mb-8">
              {step === "email"
                ? "Track your commute in real-time"
                : `Enter the code sent to ${email}`}
            </p>

            {step === "email" ? (
              <div className="space-y-6">
                {/* Google Login Button */}

                <div id="googleBtn" className="w-full"></div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold tracking-wider">
                    Or
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#123D87] focus:ring-2 focus:ring-[#123D87]/20 outline-none transition-all text-[#123D87]"
                      placeholder="commuter@citybus.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 text-white font-bold rounded-xl shadow-lg transform active:scale-[0.98] transition-all flex justify-center items-center"
                    style={{backgroundColor: PRIMARY_COLOR}}
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Get Login Code"
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <form
                onSubmit={handleOtpSubmit}
                className="space-y-6 animate-in slide-in-from-right duration-300"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    One-Time Password
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    autoFocus
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#123D87] focus:ring-2 focus:ring-[#123D87]/20 outline-none transition-all text-center text-2xl tracking-[0.5em] font-bold text-gray-800"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                  <p className="text-center mt-3 text-sm text-gray-500">
                    Didn't receive code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#123D87] font-bold hover:underline"
                    >
                      Resend
                    </button>
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading || otp.length < 4}
                    className="w-full py-4 text-white font-bold rounded-xl shadow-lg transform active:scale-[0.98] transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{backgroundColor: PRIMARY_COLOR}}
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Verify & Login"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                    }}
                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-800"
                  >
                    Back to Email
                  </button>
                </div>
              </form>
            )}
          </div>

          {step === "email" && (
            <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 border-t border-gray-100">
              By continuing, you agree to our{" "}
              <a
                href="#"
                className="font-bold hover:underline"
                style={{color: PRIMARY_COLOR}}
              >
                Terms & Conditions
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login

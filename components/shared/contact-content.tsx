"use client";

import { useState } from "react";
import { Mail, Phone, Send, User, MessageSquare } from "lucide-react";

export function ContactContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const errorData = await response.json();
        console.error("Contact form error:", errorData);
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Network error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      // Reset status after 3 seconds
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  return (
    <div className="py-12">
      {/* Contact Info Section */}
      <div className="text-center mb-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-2xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Contact Us</h3>
            <p className="text-gray-600">
              Reach out to us for any inquiries or support
            </p>
            <a
              href="mailto:contact@maghreborbit.com"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors text-lg font-medium"
            >
              <Mail className="w-5 h-5" />
              contact@maghreborbit.com
            </a>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Background overlay for extra depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-blue-600/5 rounded-2xl"></div>

          {/* Content with relative positioning */}
          <div className="relative">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Send us a Message
              </h2>
              <p className="text-gray-300">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Subject Field */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="What's this about?"
                />
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center px-8 py-4 text-lg font-bold tracking-wider transition-all duration-300 rounded-lg shadow-lg ${
                    isSubmitting
                      ? "bg-gray-400/50 text-gray-300 cursor-not-allowed backdrop-blur-sm"
                      : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:scale-105 hover:shadow-xl active:scale-95"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      SENDING...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      SEND MESSAGE
                    </>
                  )}
                </button>
              </div>

              {/* Success Message */}
              {submitStatus === "success" && (
                <div className="text-center p-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg">
                  <p className="text-green-300 font-medium">
                    ✓ Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === "error" && (
                <div className="text-center p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg">
                  <p className="text-red-300 font-medium">
                    ✗ Failed to send message. Please try again.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

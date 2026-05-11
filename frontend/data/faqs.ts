export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQs: FaqItem[] = [
  // Network Troubleshooting
  {
    id: "net-1",
    category: "Network Troubleshooting",
    question: "How to fix LOS (Loss of Signal) red light on my router/ONT?",
    answer: "A red LOS light means your Optical Network Terminal (ONT) is not receiving a signal from the fiber network. Check if the thin yellow fiber optic cable is firmly plugged into both the wall socket and the ONT. Ensure the cable is not bent sharply or pinched. If the connection is secure but the light remains red, there may be a physical fiber cut in your area or building. Please contact our support team to schedule a technician visit."
  },
  {
    id: "net-2",
    category: "Network Troubleshooting",
    question: "Why is my Wi-Fi speed slower than my subscribed plan?",
    answer: "Your subscribed plan speed (e.g., 1Gbps) represents the wired connection speed to your router. Wi-Fi speeds are naturally lower due to wireless overhead and interference. Factors affecting Wi-Fi include thick concrete walls, distance from the router, and interference from neighboring networks or appliances (like microwaves). For maximum speeds, connect your device directly to the router using a Cat 6 Ethernet cable. For better Wi-Fi coverage, consider upgrading to a mesh Wi-Fi system."
  },
  {
    id: "net-3",
    category: "Network Troubleshooting",
    question: "My connection drops frequently during video calls. What should I do?",
    answer: "Frequent drops usually indicate Wi-Fi interference or channel congestion. Try logging into your router's admin portal to change the Wi-Fi channel (channels 1, 6, and 11 are best for 2.4GHz). Additionally, ensure your router is placed in an open, elevated location away from thick walls or large metal objects. If the issue persists, reboot your ONT and router by unplugging them for 2 minutes."
  },
  
  // Setup & Equipment
  {
    id: "eq-1",
    category: "Setup & Equipment",
    question: "How do I reset my Wi-Fi password or change my network name (SSID)?",
    answer: "You can change your Wi-Fi name (SSID) and password by logging into your router's administration interface. Ensure you are connected to the network, open a web browser, and type your router's IP address (commonly 192.168.1.1 or 192.168.0.1). Log in using the admin credentials printed on the sticker under your router. Navigate to the 'Wireless' or 'WLAN' settings to update your network details."
  },
  {
    id: "eq-2",
    category: "Setup & Equipment",
    question: "Can I use my own third-party router instead of the ISP provided one?",
    answer: "Yes, you can use your own router. You will need to connect your custom router's WAN port to the LAN 1 port on our provided Optical Network Terminal (ONT). You may need to configure your router's VLAN tagging settings depending on your service zone (e.g., VLAN 500 for Singapore residential). Please refer to your specific router's manual for configuration instructions."
  },
  {
    id: "eq-3",
    category: "Setup & Equipment",
    question: "What do I do with the equipment if I cancel my subscription?",
    answer: "The Optical Network Terminal (ONT) installed on your wall is property of the infrastructure provider and must remain at the premises. However, any routers or mesh nodes provided directly by us during a promotional sign-up must be returned to one of our service centers within 14 days of cancellation to avoid non-return penalty charges."
  },

  // Billing & Account
  {
    id: "bil-1",
    category: "Billing & Account",
    question: "When will I receive my first bill and what does it include?",
    answer: "Your first bill is generated within 3 to 5 working days after your service is successfully activated. It will include the pro-rated subscription fee for the current month, the advance subscription fee for the following month, and any one-time activation or installation charges."
  },
  {
    id: "bil-2",
    category: "Billing & Account",
    question: "How do I update my payment method or credit card details?",
    answer: "Log in to your customer dashboard on our website. Navigate to the 'Billing & Payments' section, and click on 'Manage Payment Methods'. From there, you can add a new credit/debit card or set up a direct debit arrangement. Ensure your new card is set as the 'Default' for automated monthly deductions."
  },
  {
    id: "bil-3",
    category: "Billing & Account",
    question: "Why am I seeing late payment fees on my account?",
    answer: "Late payment fees are applied if your outstanding balance is not cleared by the due date stated on your invoice. If you believe this is an error, or if your auto-deduction failed, please update your payment method and contact our billing support team for a potential waiver."
  },

  // Relocation & Moving
  {
    id: "mov-1",
    category: "Relocation & Moving",
    question: "I am moving to a new house. How do I transfer my broadband service?",
    answer: "You can request a service relocation through your customer dashboard under the 'Manage Plan' section. Please submit your request at least 14 days before your moving date. Note that relocation is subject to fiber availability at your new address. A standard relocation fee applies, which covers the technician's visit and activation at the new location."
  },
  {
    id: "mov-2",
    category: "Relocation & Moving",
    question: "What if there is no fiber coverage at my new address?",
    answer: "If your new address is outside our fiber coverage zone, we will unfortunately not be able to provide service. In this scenario, early termination charges may apply depending on your remaining contract term. However, you may transfer the ownership of your contract to the new tenant of your current address to avoid these fees."
  },

  // Contact & Locations
  {
    id: "loc-1",
    category: "Contact & Locations",
    question: "Where are Brillar Broadband's headquarters and physical service centers located?",
    answer: "Our global headquarters is located at 1 Raffles Place, #44-01 One Raffles Place Tower 1, Singapore 048616. In Malaysia, our primary regional office is located at Level 20, Menara Maxis, Kuala Lumpur City Centre, 50088 Kuala Lumpur, Malaysia. You can visit either location for equipment drop-offs or face-to-face support."
  },
  {
    id: "loc-2",
    category: "Contact & Locations",
    question: "What are your customer support email addresses and contact channels?",
    answer: "For general inquiries and billing support, please email us at support@brillarbroadband.com. For enterprise and B2B partnerships, you can reach out to enterprise@brillarbroadband.com. Our support team is also available 24/7 via the live chat widget on our website."
  },
  {
    id: "loc-3",
    category: "Coverage Regions",
    question: "What regions and countries does Brillar Broadband currently serve?",
    answer: "We currently provide high-speed residential and enterprise fiber broadband across Singapore and Malaysia. In Singapore, our coverage includes major districts such as Jurong East, Tampines, Orchard, Bishan, Woodlands, and the Marina Bay Downtown area. In Malaysia, our fiber network covers key urban centers including Kuala Lumpur (Bukit Bintang, Ampang), Selangor (Subang Jaya), Penang (Georgetown), Johor Bahru (Skudai), and Sabah (Kota Kinabalu)."
  }
];

import nodemailer from "nodemailer";
import img from '@/public/images/logo.png'
const path = require("path");

const logoPath = path.join(process.cwd(), "public", "images", "logo.png");

console.log(logoPath);

export async function POST(request) {
  try {
    const data = await request.json();

    const {
      name,
      phone,
      email,
      service,
      subject,
      message
    } = data;


    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });


    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "rohitaoneautomation@gmail.com",
      subject: `New Contact: ${subject}`,

      html: `
        <div style="font-family:Arial,sans-serif;">
      
      <div style="text-align:center;">
        <img 
          src="cid:companylogo"
          alt="Company Logo"
          width="150"
        />
        <p>A-One Automation</p>
      </div>

      <h2>Query From - </h2>

      <p><b>Name:</b> ${name}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Service:</b> ${service}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p><b>Message:</b> ${message}</p>

    </div>
      `
      ,
    attachments: [
  {
    filename: "logo.png",
    path: path.join(process.cwd(), "public", "images", "logo.png"),
    cid: "companylogo", // ye ID hai
  },
]
    });


    return Response.json({
      success:true,
      message:"Email sent successfully"
    });


  } catch(error){

    console.log(error);

    return Response.json(
      {
        success:false,
        message:"Email failed"
      },
      {
        status:500
      }
    );
  }
}
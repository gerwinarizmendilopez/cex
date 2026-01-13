from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
import os
from typing import Optional

SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'noreply@vclub.com')


async def send_verification_email(to_email: str, verification_code: str) -> bool:
    """
    Enviar email de verificación con código
    """
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        
        from_email = Email(FROM_EMAIL)
        to_email = To(to_email)
        subject = "Verifica tu cuenta en HØME"
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #000000;
                    color: #ffffff;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #18181b;
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    border-radius: 8px;
                    padding: 40px;
                }}
                .logo {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .logo img {{
                    width: 80px;
                    height: 80px;
                }}
                .code {{
                    background-color: #dc2626;
                    color: #ffffff;
                    font-size: 32px;
                    font-weight: bold;
                    text-align: center;
                    padding: 20px;
                    border-radius: 8px;
                    letter-spacing: 8px;
                    margin: 30px 0;
                }}
                .footer {{
                    text-align: center;
                    color: #9ca3af;
                    font-size: 12px;
                    margin-top: 30px;
                }}
                h1 {{
                    color: #dc2626;
                    text-align: center;
                    font-size: 36px;
                    margin: 0;
                }}
                p {{
                    color: #d1d5db;
                    line-height: 1.6;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <img src="https://customer-assets.emergentagent.com/job_beatmarket-43/artifacts/nqptbjvc_Sin%20t%C3%ADtulo-1-Recuperado-Recuperado%20%281%29.png" alt="HØME Logo">
                    <h1>HØME</h1>
                </div>
                
                <h2 style="text-align: center;">Verifica tu cuenta</h2>
                
                <p>Hola,</p>
                
                <p>Gracias por registrarte en HØME. Para completar tu registro, por favor usa el siguiente código de verificación:</p>
                
                <div class="code">{verification_code}</div>
                
                <p>Este código expirará en <strong>10 minutos</strong>.</p>
                
                <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
                
                <div class="footer">
                    <p>© 2025 HØME. Beats que te hacen ganar dinero.</p>
                    <p>Este es un email automático, por favor no respondas.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text content
        plain_content = f"""
        Verifica tu cuenta en HØME
        
        Tu código de verificación es: {verification_code}
        
        Este código expirará en 10 minutos.
        
        Si no creaste esta cuenta, puedes ignorar este email.
        
        © 2025 HØME
        """
        
        content = Content("text/html", html_content)
        mail = Mail(from_email, to_email, subject, plain_text_content=plain_content, html_content=html_content)
        
        response = sg.client.mail.send.post(request_body=mail.get())
        
        return response.status_code in [200, 201, 202]
        
    except Exception as e:
        print(f"Error enviando email: {str(e)}")
        return False


async def send_purchase_confirmation_email(
    to_email: str, 
    beat_name: str, 
    license_type: str, 
    amount: float,
    download_url: Optional[str] = None
) -> bool:
    """
    Enviar email de confirmación de compra
    """
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        
        from_email = Email(FROM_EMAIL)
        to_email = To(to_email)
        subject = f"Tu compra: {beat_name} - HØME"
        
        license_names = {
            'basica': 'Básica',
            'premium': 'Premium',
            'exclusiva': 'Exclusiva'
        }
        
        license_display = license_names.get(license_type, license_type)
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #000000;
                    color: #ffffff;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #18181b;
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    border-radius: 8px;
                    padding: 40px;
                }}
                .success-icon {{
                    text-align: center;
                    font-size: 48px;
                    margin-bottom: 20px;
                }}
                .order-details {{
                    background-color: #0a0a0a;
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .download-button {{
                    display: inline-block;
                    background-color: #dc2626;
                    color: #ffffff;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    text-align: center;
                    margin: 20px 0;
                }}
                h1 {{
                    color: #dc2626;
                    text-align: center;
                }}
                p {{
                    color: #d1d5db;
                    line-height: 1.6;
                }}
                .footer {{
                    text-align: center;
                    color: #9ca3af;
                    font-size: 12px;
                    margin-top: 30px;
                    border-top: 1px solid rgba(220, 38, 38, 0.2);
                    padding-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon">✅</div>
                
                <h1>¡Compra Exitosa!</h1>
                
                <p>Gracias por tu compra en HØME.</p>
                
                <div class="order-details">
                    <h3 style="color: #dc2626; margin-top: 0;">Detalles de tu orden:</h3>
                    <p><strong>Beat:</strong> {beat_name}</p>
                    <p><strong>Licencia:</strong> {license_display}</p>
                    <p><strong>Monto:</strong> ${amount:.2f} USD</p>
                </div>
                
                {"<a href='" + download_url + "' class='download-button'>Descargar Beat</a>" if download_url else ""}
                
                <p>Tu beat y el contrato de licencia en PDF están listos para descargar.</p>
                
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                
                <div class="footer">
                    <p>© 2025 V CLUB. Beats que te hacen ganar dinero.</p>
                    <p>home.recordsinfo@gmail.com</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        content = Content("text/html", html_content)
        mail = Mail(from_email, to_email, subject, html_content=html_content)
        
        response = sg.client.mail.send.post(request_body=mail.get())
        
        return response.status_code in [200, 201, 202]
        
    except Exception as e:
        print(f"Error enviando email de compra: {str(e)}")
        return False

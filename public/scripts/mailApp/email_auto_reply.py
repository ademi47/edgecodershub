"""
Email Auto-Reply System
Monitors Gmail inbox and sends automatic replies based on message content
"""

import imaplib
import smtplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import decode_header
import time
import re
from datetime import datetime
import json

class EmailAutoReply:
    def __init__(self, email_address, app_password, start_date=None):
        """
        Initialize the email auto-reply system
        
        Args:
            email_address: Your Gmail address
            app_password: Gmail app password (not your regular password)
            start_date: Optional date to start processing emails from (datetime.date object or None for today)
        """
        self.email_address = email_address
        self.app_password = app_password
        self.imap_server = "imap.gmail.com"
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.processed_emails = set()
        self.start_date = start_date  # If None, will use today's date
        
        # Load reply rules
        self.reply_rules = self.load_default_rules()
    
    def load_default_rules(self):
        """Define default reply rules based on message content"""
        return [
            {
                "keywords": ["meeting", "schedule", "appointment", "calendar"],
                "reply_template": """Hello,

Thank you for your email regarding scheduling. I've received your message and will review my calendar to find a suitable time.

I'll get back to you within 24 hours with my availability.

Best regards"""
            },
            {
                "keywords": ["urgent", "asap", "emergency", "immediate"],
                "reply_template": """Hello,

I've received your urgent message and it has been flagged for priority attention.

I will respond as soon as possible.

Best regards"""
            },
            {
                "keywords": ["quote", "pricing", "price", "cost", "estimate"],
                "reply_template": """Hello,

Thank you for your inquiry about pricing. I've received your request for a quote.

I will prepare the information and send you a detailed response within 2 business days.

Best regards"""
            },
            {
                "keywords": ["support", "help", "issue", "problem", "bug"],
                "reply_template": """Hello,

Thank you for contacting support. Your message has been received and logged.

Our support team will review your issue and respond within 24-48 hours.

Best regards"""
            },
            {
                "keywords": ["invoice", "payment", "bill", "receipt"],
                "reply_template": """Hello,

Thank you for your message regarding billing. I've received your inquiry.

Our accounting team will review this and respond within 2 business days.

Best regards"""
            },
            {
                "keywords": ["application", "job", "position", "resume", "cv"],
                "reply_template": """Hello,

Thank you for your interest and for submitting your application. We have received your materials.

Our team will review your application and contact you if your qualifications match our current needs.

Best regards"""
            }
        ]
    
    def connect_imap(self):
        """Connect to Gmail IMAP server"""
        try:
            mail = imaplib.IMAP4_SSL(self.imap_server)
            mail.login(self.email_address, self.app_password)
            return mail
        except Exception as e:
            print(f"Failed to connect to IMAP: {e}")
            return None
    
    def decode_subject(self, subject):
        """Decode email subject"""
        if subject is None:
            return ""
        decoded = decode_header(subject)
        subject_str = ""
        for content, encoding in decoded:
            if isinstance(content, bytes):
                subject_str += content.decode(encoding if encoding else 'utf-8')
            else:
                subject_str += content
        return subject_str
    
    def get_email_body(self, msg):
        """Extract email body from message"""
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                if content_type == "text/plain":
                    try:
                        body = part.get_payload(decode=True).decode()
                        break
                    except:
                        pass
        else:
            try:
                body = msg.get_payload(decode=True).decode()
            except:
                pass
        return body
    
    def analyze_message(self, subject, body):
        """Analyze message and find matching reply rule"""
        text = (subject + " " + body).lower()
        
        for rule in self.reply_rules:
            for keyword in rule["keywords"]:
                if keyword.lower() in text:
                    return rule["reply_template"]
        
        # Default reply if no specific rule matches
        return """Hello,

Thank you for your email. I have received your message and will respond shortly.

Best regards"""
    
    def send_reply(self, to_address, subject, body, original_msg_id=None):
        """Send email reply"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.email_address
            msg['To'] = to_address
            msg['Subject'] = f"Re: {subject}"
            
            if original_msg_id:
                msg['In-Reply-To'] = original_msg_id
                msg['References'] = original_msg_id
            
            # Add signature
            full_body = body + f"\n\n{self.email_address}"
            msg.attach(MIMEText(full_body, 'plain'))
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_address, self.app_password)
            server.send_message(msg)
            server.quit()
            
            print(f"✓ Reply sent to {to_address}")
            return True
        except Exception as e:
            print(f"✗ Failed to send reply: {e}")
            return False
    
    def process_unread_emails(self):
        """Process all unread emails and send auto-replies"""
        mail = self.connect_imap()
        if not mail:
            return
        
        try:
            # Select inbox
            mail.select('INBOX')
            
            # Get the start date (use today if not specified)
            from datetime import date
            search_date = self.start_date if self.start_date else date.today()
            date_str = search_date.strftime("%d-%b-%Y")
            
            # Search for unread emails received on or after the start date
            # SINCE searches for emails on or after the specified date
            status, messages = mail.search(None, f'(UNSEEN SINCE {date_str})')
            
            if status != "OK":
                print("No new messages")
                return
            
            email_ids = messages[0].split()
            
            if not email_ids:
                print(f"No unread emails found from {date_str} onwards")
                return
            
            print(f"\nFound {len(email_ids)} unread email(s) from {date_str} onwards")
            
            for email_id in email_ids:
                email_id_str = email_id.decode()
                
                # Skip if already processed
                if email_id_str in self.processed_emails:
                    continue
                
                # Fetch email
                status, msg_data = mail.fetch(email_id, '(RFC822)')
                
                if status != "OK":
                    continue
                
                # Parse email
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)
                
                # Get sender
                from_header = msg.get('From')
                sender_email = email.utils.parseaddr(from_header)[1]
                
                # Skip if sender is self
                if sender_email == self.email_address:
                    self.processed_emails.add(email_id_str)
                    continue
                
                # Get subject and body
                subject = self.decode_subject(msg.get('Subject'))
                body = self.get_email_body(msg)
                msg_id = msg.get('Message-ID')
                
                print(f"\n{'='*60}")
                print(f"From: {sender_email}")
                print(f"Subject: {subject}")
                print(f"Preview: {body[:100]}...")
                
                # Analyze and get reply
                reply_body = self.analyze_message(subject, body)
                
                # Send reply
                if self.send_reply(sender_email, subject, reply_body, msg_id):
                    self.processed_emails.add(email_id_str)
                    # Mark as read
                    mail.store(email_id, '+FLAGS', '\\Seen')
                
                print(f"{'='*60}")
            
        except Exception as e:
            print(f"Error processing emails: {e}")
        finally:
            mail.close()
            mail.logout()
    
    def run_continuous(self, check_interval=60):
        """Run the auto-reply system continuously"""
        print(f"Email Auto-Reply System Started")
        print(f"Monitoring: {self.email_address}")
        print(f"Check interval: {check_interval} seconds")
        print("Press Ctrl+C to stop\n")
        
        try:
            while True:
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                print(f"[{timestamp}] Checking for new emails...")
                
                self.process_unread_emails()
                
                print(f"Waiting {check_interval} seconds until next check...\n")
                time.sleep(check_interval)
                
        except KeyboardInterrupt:
            print("\n\nAuto-reply system stopped by user")
    
    def add_custom_rule(self, keywords, reply_template):
        """Add a custom reply rule"""
        self.reply_rules.append({
            "keywords": keywords,
            "reply_template": reply_template
        })
        print(f"✓ Added custom rule for keywords: {keywords}")
    
    def save_rules(self, filename="reply_rules.json"):
        """Save reply rules to file"""
        with open(filename, 'w') as f:
            json.dump(self.reply_rules, f, indent=2)
        print(f"✓ Rules saved to {filename}")
    
    def load_rules(self, filename="reply_rules.json"):
        """Load reply rules from file"""
        try:
            with open(filename, 'r') as f:
                self.reply_rules = json.load(f)
            print(f"✓ Rules loaded from {filename}")
        except FileNotFoundError:
            print(f"✗ File {filename} not found, using default rules")


if __name__ == "__main__":
    # Configuration
    EMAIL = ""  # Replace with your email
    APP_PASSWORD = ""  # Replace with your Gmail app password
    
    # Check if credentials are still default
    if EMAIL == "your.email@gmail.com" or APP_PASSWORD == "your-app-password":
        print("\n" + "="*60)
        print("⚠️  CONFIGURATION REQUIRED")
        print("="*60)
        print("\nYou need to update your credentials in this file:")
        print("1. Open email_auto_reply.py in a text editor")
        print("2. Find the lines with EMAIL and APP_PASSWORD")
        print("3. Replace with your actual Gmail address and app password")
        print("\nGet app password at: https://myaccount.google.com/apppasswords")
        print("="*60 + "\n")
        input("Press Enter to exit...")
        exit()
    
    # Create auto-reply system
    # By default, it will only process emails from TODAY onwards
    auto_reply = EmailAutoReply(EMAIL, APP_PASSWORD)
    
    # OPTIONAL: Set a custom start date
    # Uncomment and modify the lines below to start from a specific date:
    # from datetime import date
    # custom_date = date(2025, 10, 22)  # Year, Month, Day
    # auto_reply = EmailAutoReply(EMAIL, APP_PASSWORD, start_date=custom_date)
    
    # Optional: Add custom rules
    # auto_reply.add_custom_rule(
    #     keywords=["refund", "return"],
    #     reply_template="Thank you for your refund request. Our team will process this within 5 business days."
    # )
    
    # Run the system (checks every 60 seconds)
    auto_reply.run_continuous(check_interval=60)

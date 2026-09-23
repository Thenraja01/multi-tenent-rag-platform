import asyncio
import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization_models import Organization, OrganizationSettings
from app.models.identity_models import User

logger = logging.getLogger("nexusrag.email_service")


class EmailService:
    """
    Enterprise Multi-Tenant SMTP Mailing Engine:
    - Resolves organization-specific SMTP server settings or falls back to platform defaults.
    - Asynchronous non-blocking delivery with TLS/SSL & connection verification.
    - Responsive, professional HTML transactional templates.
    """

    @staticmethod
    async def get_smtp_config_for_org(
        db: AsyncSession,
        organization_id: Optional[str],
    ) -> Dict[str, Any]:
        """Fetch active SMTP configuration for tenant organization or platform default."""
        if organization_id:
            stmt = select(OrganizationSettings).where(OrganizationSettings.organization_id == organization_id)
            res = await db.execute(stmt)
            settings_obj = res.scalar_one_or_none()
            if settings_obj and settings_obj.smtp_config:
                cfg = settings_obj.smtp_config
                if cfg.get("is_enabled", True) and cfg.get("host"):
                    return {
                        "host": cfg.get("host"),
                        "port": int(cfg.get("port", 587)),
                        "username": cfg.get("username", ""),
                        "password": cfg.get("password", ""),
                        "use_tls": cfg.get("use_tls", True),
                        "use_ssl": cfg.get("use_ssl", False),
                        "from_email": cfg.get("from_email", "noreply@nexusrag.app"),
                        "from_name": cfg.get("from_name", "Nexus Enterprise"),
                        "is_enabled": True,
                        "source": "tenant",
                    }

        # Fallback to local / environment default configuration
        return {
            "host": "localhost",
            "port": 587,
            "username": "",
            "password": "",
            "use_tls": False,
            "use_ssl": False,
            "from_email": "noreply@nexusrag.local",
            "from_name": "Nexus Platform",
            "is_enabled": False,
            "source": "default",
        }

    @staticmethod
    def _sync_test_connection(config: Dict[str, Any]) -> Tuple[bool, str]:
        """Synchronous SMTP connection and authentication tester."""
        host = config.get("host")
        port = int(config.get("port", 587))
        username = config.get("username", "").strip()
        password = config.get("password", "")
        use_tls = config.get("use_tls", True)
        use_ssl = config.get("use_ssl", False)

        if not host:
            return False, "SMTP Host is required."

        try:
            if use_ssl:
                context = ssl.create_default_context()
                server = smtplib.SMTP_SSL(host, port, timeout=10, context=context)
            else:
                server = smtplib.SMTP(host, port, timeout=10)

            server.ehlo()

            if use_tls and not use_ssl:
                context = ssl.create_default_context()
                server.starttls(context=context)
                server.ehlo()

            if username and password:
                server.login(username, password)

            server.quit()
            return True, f"Successfully connected and authenticated to {host}:{port}"
        except smtplib.SMTPAuthenticationError as e:
            return False, f"SMTP Authentication failed for user '{username}': {e.smtp_error.decode() if isinstance(e.smtp_error, bytes) else str(e)}"
        except smtplib.SMTPConnectError as e:
            return False, f"Could not establish connection to {host}:{port}: {e}"
        except Exception as e:
            return False, f"SMTP Connection failed: {str(e)}"

    @classmethod
    async def verify_smtp_connection(cls, config: Dict[str, Any]) -> Tuple[bool, str]:
        """Asynchronously verify SMTP settings."""
        return await asyncio.to_thread(cls._sync_test_connection, config)

    @staticmethod
    def _sync_send_email(
        config: Dict[str, Any],
        to_email: str,
        subject: str,
        html_content: str,
        plain_text: Optional[str] = None,
    ) -> Tuple[bool, str]:
        """Synchronous sender executing inside thread worker."""
        host = config.get("host")
        port = int(config.get("port", 587))
        username = config.get("username", "").strip()
        password = config.get("password", "")
        use_tls = config.get("use_tls", True)
        use_ssl = config.get("use_ssl", False)
        from_email = config.get("from_email", "noreply@nexusrag.app")
        from_name = config.get("from_name", "Nexus Enterprise")

        if not host:
            return False, "No SMTP host configured."

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{from_email}>"
        msg["To"] = to_email

        # Attach text and html
        if plain_text:
            msg.attach(MIMEText(plain_text, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        try:
            if use_ssl:
                context = ssl.create_default_context()
                server = smtplib.SMTP_SSL(host, port, timeout=15, context=context)
            else:
                server = smtplib.SMTP(host, port, timeout=15)

            server.ehlo()

            if use_tls and not use_ssl:
                context = ssl.create_default_context()
                server.starttls(context=context)
                server.ehlo()

            if username and password:
                server.login(username, password)

            server.sendmail(from_email, [to_email], msg.as_string())
            server.quit()
            logger.info(f"Email sent successfully to {to_email} via {host}:{port}")
            return True, f"Email delivered to {to_email}"
        except Exception as e:
            logger.error(f"Failed to send email to {to_email} via {host}:{port}: {e}")
            return False, str(e)

    @classmethod
    async def send_email(
        cls,
        config: Dict[str, Any],
        to_email: str,
        subject: str,
        html_content: str,
        plain_text: Optional[str] = None,
    ) -> Tuple[bool, str]:
        """Dispatch email non-blockingly."""
        return await asyncio.to_thread(
            cls._sync_send_email,
            config,
            to_email,
            subject,
            html_content,
            plain_text,
        )

    # -------------------------------------------------------------------------
    # HTML Email Templates
    # -------------------------------------------------------------------------

    @classmethod
    async def send_test_email(
        cls,
        config: Dict[str, Any],
        to_email: str,
        organization_name: str = "Nexus Enterprise",
    ) -> Tuple[bool, str]:
        """Send verification test email."""
        subject = f"✅ SMTP Connection Test — {organization_name}"
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }}
            .container {{ max-width: 560px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
            .badge {{ display: inline-block; padding: 6px 14px; background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }}
            h1 {{ font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 12px; }}
            p {{ font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px; }}
            .config-box {{ background: #0f172a; border-radius: 10px; border: 1px solid #334155; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 12px; color: #cbd5e1; }}
            .footer {{ font-size: 11px; color: #64748b; margin-top: 24px; text-align: center; border-top: 1px solid #334155; padding-top: 16px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="badge">SMTP Verified</div>
            <h1>Your Custom Mail Server is Ready</h1>
            <p>This is a test notification confirming that the outgoing SMTP configuration for <strong>{organization_name}</strong> is functional and verified.</p>
            <div class="config-box">
              <div><strong>Host:</strong> {config.get('host')}</div>
              <div><strong>Port:</strong> {config.get('port')}</div>
              <div><strong>Sender:</strong> {config.get('from_name')} &lt;{config.get('from_email')}&gt;</div>
              <div><strong>Encryption:</strong> {'SSL' if config.get('use_ssl') else ('STARTTLS' if config.get('use_tls') else 'None')}</div>
            </div>
            <p>All transactional messages, user invitations, and system alert emails will now be delivered via this mail server.</p>
            <div class="footer">
              Sent securely by NexusRAG Multi-Tenant Enterprise Platform
            </div>
          </div>
        </body>
        </html>
        """
        plain = f"SMTP Connection Test for {organization_name}. Outgoing host: {config.get('host')}:{config.get('port')}. Configuration is active and verified."
        return await cls.send_email(config, to_email, subject, html, plain)

    @classmethod
    async def send_invitation_email(
        cls,
        config: Dict[str, Any],
        to_email: str,
        inviter_name: str,
        organization_name: str,
        role_name: str,
        department_name: Optional[str],
        invite_url: str,
    ) -> Tuple[bool, str]:
        """Send team member onboarding invitation email."""
        subject = f"You're invited to join {organization_name} on NexusRAG"
        dept_str = f"in the <strong>{department_name}</strong> department " if department_name else ""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }}
            .container {{ max-width: 560px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
            h1 {{ font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 12px; }}
            p {{ font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px; }}
            .btn {{ display: inline-block; padding: 12px 24px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; margin: 20px 0; }}
            .footer {{ font-size: 11px; color: #64748b; margin-top: 24px; text-align: center; border-top: 1px solid #334155; padding-top: 16px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Join {organization_name}</h1>
            <p><strong>{inviter_name}</strong> has invited you to join <strong>{organization_name}</strong> {dept_str}as an <strong>{role_name}</strong>.</p>
            <p>NexusRAG provides zero-trust workspace portals, secure enterprise search, and AI-grounded department workflows.</p>
            <div style="text-align: center;">
              <a href="{invite_url}" class="btn">Accept Invitation & Set Password</a>
            </div>
            <p style="font-size: 12px; color: #64748b;">If the button above does not work, copy and paste this link into your browser:<br><span style="color: #818cf8; word-break: break-all;">{invite_url}</span></p>
            <div class="footer">
              This invitation was sent by {organization_name} via NexusRAG.
            </div>
          </div>
        </body>
        </html>
        """
        plain = f"You have been invited by {inviter_name} to join {organization_name} as {role_name}. Accept here: {invite_url}"
        return await cls.send_email(config, to_email, subject, html, plain)

    @classmethod
    async def send_approval_email(
        cls,
        config: Dict[str, Any],
        to_email: str,
        user_name: str,
        organization_name: str,
        login_url: str,
    ) -> Tuple[bool, str]:
        """Send account approval notification."""
        subject = f"🎉 Account Approved — Welcome to {organization_name}"
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }}
            .container {{ max-width: 560px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; }}
            h1 {{ font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 12px; }}
            p {{ font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px; }}
            .btn {{ display: inline-block; padding: 12px 24px; background: #10b981; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; margin: 20px 0; }}
            .footer {{ font-size: 11px; color: #64748b; margin-top: 24px; text-align: center; border-top: 1px solid #334155; padding-top: 16px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your Account Has Been Activated</h1>
            <p>Hello <strong>{user_name}</strong>,</p>
            <p>Your membership request for <strong>{organization_name}</strong> has been reviewed and approved by the Organization Administrator.</p>
            <p>You can now sign in and access your departmental tools, knowledge base, and enterprise assistant.</p>
            <div style="text-align: center;">
              <a href="{login_url}" class="btn">Enter Workspace</a>
            </div>
            <div class="footer">
              NexusRAG Enterprise Identity Gateway
            </div>
          </div>
        </body>
        </html>
        """
        plain = f"Hello {user_name}, your account for {organization_name} has been approved. Sign in here: {login_url}"
        return await cls.send_email(config, to_email, subject, html, plain)


email_service = EmailService()

"""Email utilities.

This module intentionally contains a stub to make it easy to integrate
transactional email services later.
"""

from typing import Protocol


class EmailBackend(Protocol):
    def send(self, *, subject: str, recipient: str, body: str) -> None:
        ...


class ConsoleEmailBackend:
    """Simple backend that prints emails to the console."""

    def send(self, *, subject: str, recipient: str, body: str) -> None:  # pragma: no cover
        print(f"Sending email to {recipient}: {subject}\n{body}")


default_email_backend = ConsoleEmailBackend()

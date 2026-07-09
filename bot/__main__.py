from __future__ import annotations

import asyncio
import logging
import sys

from bot.main import run_bot

logger = logging.getLogger(__name__)


def main() -> None:
    try:
        asyncio.run(run_bot())
    except RuntimeError as error:
        logger.error("%s", error)
        sys.exit(1)
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
        sys.exit(0)


if __name__ == "__main__":
    main()

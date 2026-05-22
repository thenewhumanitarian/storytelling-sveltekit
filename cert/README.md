# Local HTTPS certificates

These files are **not in git**. Each developer generates their own with [mkcert](https://github.com/FiloSottile/mkcert):

```bash
cd cert
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
```

See the main [README — HTTPS Setup](../README.md#https-setup-mkcert) for full instructions.

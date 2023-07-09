#### Download cloud-sql-proxy [Cloud SQL Auth proxy Operator]

Read More: https://cloud.google.com/sql/docs/mysql/sql-proxy

Windows 64 Bit: https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.4.0/cloud-sql-proxy.x64.exe

Linux 64 Bit:

```bash
$ sudo curl -o cloud-sql-proxy \
  https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.4.0/cloud-sql-proxy.linux.amd64

$ chmod +x cloud-sql-proxy
```

#### Export GOOGLE_APPLICATION_CREDENTIALS
Make sure you have the service account creadentials in a `key.json` file in the root directory.
```bash
$ export GOOGLE_APPLICATION_CREDENTIALS=/home/rwitesh/Desktop/TenderFlowBackend/key.json
```

#### Run Cloud SQL Proxy

```bash
$ ./cloud-sql-proxy <PROJECT>:<REGION>:<INSTANCE>

$ ./cloud-sql-proxy tenderflow-391318:us-central1:tenderflowsql
```


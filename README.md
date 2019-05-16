# mounte-bank-demo

## Mountebank安装

1. 安装Nodejs
`  wget https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-x64.tar.xz `
2. 安装Mountebank
`  npm install -g mountebank `

3. 启动Mountebank
`   mb `

4. 创建mock服务
```  
curl -i -X POST -H 'Content-Type: application/json' http://localhost:2525/imposters --data '{
      "port": 4545,
      "protocol": "http",
      "stubs": [{
        "responses": [
          { "is": { "statusCode": 400 }}
        ],
        "predicates": [{
          "and": [
            {
              "equals": {
                "path": "/test",
                "method": "POST",
                "headers": { "Content-Type": "application/json" }
              }
            },
            {
              "not": {
                "contains": { "body": "requiredField" },
                "caseSensitive": true
              }
            }
          ]
        }]
      }]
    }'
```
5. 验证mock服务
`   curl -i -X POST -H 'Content-Type: application/json' http://localhost:4545/test --data '{"optionalField": true}' `
`    curl -i -X POST http://localhost:4545/test --data '{"optionalField": true}' `

6. 创建tcp mock
```    
curl -i -X POST -H 'Content-Type: application/json' http://localhost:2525/imposters --data '{
      "port": 5555,
      "protocol": "tcp",
      "mode": "binary",
      "stubs": [{
        "responses": [
          { "is": { "data": "aGVsbG8sIHdvcmxkIQ==" }}
        ],
        "predicates": [{ "contains": { "data": "c2F5SGVsbG8=" } }]
      }]
    }'
```
7. 验证tcp
`    echo "Calling sayHello over binary protocol" | nc localhost 5555 `

8. 关闭mock
`    curl -X DELETE http://localhost:2525/imposters/4545 `
`    curl -X DELETE http://localhost:2525/imposters/5555 `


***
***

# ejs 注入方式
## 初始化启动 mountebank
`mb --configfile ${mountebank_demo_path}\mountebank_ejs\main.ejs --allowInjection `


## main.ejs源码
```
{
  "imposters": [
    <% include proxy.ejs %>,
    <% include serviceA.ejs %>
  ]
}
```

## serviceA.ejs源码
```
{
    "port": 8187,
    "protocol": "http",
    "stubs": [
        <% include recharge.ejs %>,
        <% include withdraw.ejs %>,
        <% include createAccount.ejs %>
    ]
}
```

## createAccount.ejs源码
```
{
    "predicates": [
        {
            "contains": {
                "path": "/v1/createAccount",
                "body": "\"merchantId\":\"123\""
            }
        }
    ],
    "responses": [
        {
            "is": {
                "statusCode": 500,
                "headers": {
                    "Server": "Apache-Coyote/1.1",
                    "Content-Type": "text/json;charset=UTF-8",
                    "Content-Length": 298,
                    "Date": "Tue, 05 Sep 2017 06:49:14 GMT",
                    "Connection": "close"
                },
                "body": "{\"data\":{\"errCode\":\"iia-trade-00010\",\"errMsg\":\"商户不存在\"},\"message\":\"业务处理失败\",\"status\":\"GW-10510\",\"sign\":\"6tbbBajxsMTsql1Gl/VSsI7BHilAvCtA9J0FGiN7+p3Nde7vwZVd9taneNIp4M1zsRhqXXHMFTp67ZFTUItcI8PB4UFnltXomCCW1Jya7dI+hpQilUs2rLQ1WcumGN3GqjWaE472FQbOX2muzcUjJbsMosTo+P0SPawhO5m83Uw=\"}",
                "_mode": "text",
                "_proxyResponseTime": 135
            }
        }
    ]
},
{
    "predicates": [
        {
            "deepEquals": {
                "path": "/v1/createAccount",
                "body": "\"accountNo\":\"123\""
            }
        }
    ],
    "responses": [
        {
            "is": {
                "statusCode": 500,
                "headers": {
                    "Server": "Apache-Coyote/1.1",
                    "Content-Type": "text/json;charset=UTF-8",
                    "Content-Length": 299,
                    "Date": "Wed, 06 Sep 2017 07:53:46 GMT",
                    "Connection": "close"
                },
                "body": "{\"data\":{\"errCode\":\"iia-acct-00003\",\"errMsg\":\"账户不存在123899\"},\"message\":\"业务处理失败\",\"status\":\"GW-10510\",\"sign\":\"v31ud5d5le/XspEbZevxgu3y5oBfW8lAlyWbeL3O4UnZlIY6Fw8kPreoti4de/CbEI0TpoGCkMAz5NWEAXcX4sny2DM8MK8ZxFAZ2x17H4obaxHKcu09n4a2deEHyaie4k021/8q1t5fucO7ZoEI9QZvyGj/JhC7AzEq1RagFOk=\"}",
                "_mode": "text",
                "_proxyResponseTime": 661
            }
        }
    ]
}
```
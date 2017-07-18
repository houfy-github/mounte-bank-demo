#!/bin/sh

set -e
RUN_RESULT=$(docker ps | grep hasanozgan/mountebank | wc -l)
if [ "$RUN_RESULT" -eq 0 ]; then
  docker run -p 2525:2525 -p 4545:4545 -d hasanozgan/mountebank
fi
MOUNTEBANK_URI=http://localhost:2525

for i in 1 2 3 4 5 6 7 8 9 10
do
  BANK_IS_OPEN=1
  curl $MOUNTEBANK_URI/imposters || BANK_IS_OPEN=0
  if [ $BANK_IS_OPEN -eq 1 ]; then
    break
  fi
  echo "Mountebank is not running. Trying again..."
  sleep 1
done
curl -X DELETE $MOUNTEBANK_URI/imposters/4545
curl -X POST -H 'Content-Type: application/json' -d @stubs.json $MOUNTEBANK_URI/imposters


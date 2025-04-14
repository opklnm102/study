

spring jpa pagenation 


https://stackoverflow.com/questions/26738199/how-to-disable-count-when-specification-and-pageable-are-used-together




이거랑
request size + 1
하는 방법으로 next page가 있는지 없는지 판단하면 될듯



query size = request size + 1 
transactions.size() > request size ? page + 1 : -1

client에서 10개가 필요할 경우
11개를 쿼리해서 next page가 있는지 확인하는 방법

 resultMap.put("nextPage", transactions.size() > limit ? page + 1 : -1);
resultMap.put("transactions", this.convertWalletTransactionVOs(transactions).subList(0, Math.min(limit, transactions.size())));
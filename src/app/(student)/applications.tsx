print subarray



// int sum =0;
// unordered_map<int,int> mp;

// for(auto i : arr){
  //   mp[i]++;
  // }
  
  
  intput: arr, target

sort(arr.begin(),arr.end());
// arr > 1
int l =0; 
int r=1;
int sum=arr[l];
int n=Array.size();
vector<vector<int,int>> ans;
vector<int> subarray;
while(r<n){
  sum += arr[r];
  if(sum>target){
    ans.push_back(subarray);

  }else if(sum < target){
    subarray.push_back({arr[r]});
  }

}

return ans


ex: 10;
dp[0]

i=3

x=1
dp[3]+= dp[2]

vector<int> dp(target);
dp[0]=1;

for(int i=1;i <=target;i++){
  for(int x:arr){
    if (i >= x){
      dp[i] += dp[i-x];
    }
  }
}

return dp[target];
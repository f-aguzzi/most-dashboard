rm(list=ls())
gc()
#### Libraries
library(data.table)
library(dplyr)
library(AER)
library(nloptr)
library(Matrix)
library(stargazer)
library(Rfast)
library(kableExtra)
library(nleqslv)
library(MASS)
library(haven)
library(texreg)
library(readr)
library(readxl)

#### Path to be changed ####
setwd(".")

# Load data ----
mydata<- read_csv("mydata.csv")
names(mydata)
thetafin3<- read_xlsx("Book2.xlsx")

#### Creating Dummies for city of origin and of destination
library("fastDummies")
dum_airline=dummy_cols(mydata$opalcodeleg1,remove_first_dummy = TRUE)
name_dum_airline=names(dum_airline[,2:ncol(dum_airline)])
dum_month=dummy_cols(mydata$month,remove_first_dummy = TRUE)
name_dum_month=names(dum_month[,2:ncol(dum_month)])
dum_year=dummy_cols(mydata$year,remove_first_dummy = TRUE)
name_dum_year=names(dum_year[,2:ncol(dum_year)])
dum_dep_air=dummy_cols(mydata$depairportcode,remove_first_dummy = TRUE)
name_dum_dep_air=names(dum_dep_air[,2:ncol(dum_dep_air)])

#### Exogeneous variables ########
list_endog_demand=c("price", "log_sjconditionalm")

list_control_variables=c("direct","dist_od","co2seat_wavg_od","hsr","lcc",
             name_dum_month,name_dum_year,name_dum_dep_air,"arrAOI","arrBDS",
               "arrBGY","arrBLQ","arrBRI","arrBZO","arrCAG","arrCIA",
                       "arrCIY","arrCRV","arrCTA","arrCUF","arrEBA","arrFCO",
                       "arrFLR","arrFRL","arrGOA","arrLIN","arrLMP","arrMXP",
                       "arrNAP","arrOLB","arrPEG","arrPMF","arrPMO","arrPNL",
                       "arrPSA","arrPSR","arrREG","arrRMI","arrSUF","arrTPS",
                       "arrTRN","arrTRS","arrTSF","arrVBS","arrVCE","arrVRN")

list_variables_supply=c("direct","fuelcost_seat",name_dum_airline,
                        name_dum_year,name_dum_dep_air,"arrAOI","arrBDS",
                        "arrBGY","arrBLQ","arrBRI","arrBZO","arrCAG","arrCIA",
                        "arrCIY","arrCRV","arrCTA","arrCUF","arrEBA","arrFCO",
                        "arrFLR","arrFRL","arrGOA","arrLIN","arrLMP","arrMXP",
                        "arrNAP","arrOLB","arrPEG","arrPMF","arrPMO","arrPNL",
                        "arrPSA","arrPSR","arrREG","arrRMI","arrSUF","arrTPS",
                        "arrTRN","arrTRS","arrTSF","arrVBS","arrVCE","arrVRN")

############################################################
############### Counterfactual ###############
############################################################
theta0 = t(thetafin3)
theta0 = theta0[2,]
theta0 = as.numeric(theta0)

nd=102
ns=103
theta_d=theta0[1:nd]
theta_d <- as.numeric(theta_d)
theta_s=theta0[(nd+2):(nd+ns)]
theta_s <- as.numeric(theta_s)
lambda=1-theta_d[3]
alpha=-theta_d[2]
poll=theta_d[6]
seats<-mydata$fuelcost/mydata$fuelcost_seat
mydata$seats<-seats
maxmarket=max(mydata$MkID)

##### Counterfactual function (modified to accept dist_threshold and seat_threshold)
counterfactual <-function(j, mcchange, dist_threshold, seat_threshold){
  mydataloc=mydata[mydata$MkID==j,]
  nloc=nrow(mydataloc)
  oldprice=mydataloc$price
  oldsj=mydataloc$sjm
  olds0=mydataloc$s0m
  paxeconomy=mydataloc$pax_economy
  popdep=mydataloc$pop_dep
  lcc<-mydataloc$lcc

  #### Demand equations
  mat_d=as.matrix(cbind(1,mydataloc[c(list_endog_demand,list_control_variables)]))

  oldxi=mydataloc$log_ratio_sjms0m-mat_d%*%theta_d
  olddelta=mat_d%*%theta_d+oldxi-theta_d[3]*mydataloc$log_sjconditionalm

  ### New marginal cost (using passed thresholds)
  markuploc=-(lambda)/(-alpha*(1-(1-lambda)*mydataloc$firmsharenest-lambda*mydataloc$firmshareobs))
  oldmc=(mydataloc$price-markuploc)
  innov=rep(0,nloc)
  innov[(mydataloc$dist_od<=dist_threshold) & (mydataloc$seats<=seat_threshold)]=1
  newmc=as.numeric(ifelse(oldmc>=0,oldmc-mcchange*oldmc*innov,oldmc+mcchange*oldmc*innov))
  oldco2=mydataloc$co2seat_wavg_od
  newco2=as.numeric(oldco2*(1-innov))

  #### New price
  newprice=oldprice+newmc-oldmc
  diff=1
  cpt=1
  tol=1e-2

  while (diff>tol){
    #### New marketshare
    newdelta=olddelta+alpha*oldprice-alpha*newprice-poll*oldco2+poll*newco2
    expdj=exp(newdelta/lambda)
    newdeno=sum(expdj)
    newsjg=expdj/newdeno
    news0=1/(1+newdeno^lambda)
    newsj=newsjg*(1-news0)

    #### New markup ####
    matsk=t(matrix(c(newsj),nrow=nloc,ncol=nloc))
    dsdp=-(alpha/lambda*matsk*(diag(1,nloc)-matrix(c((1-lambda)*newsjg+lambda*newsj),nrow=nloc,ncol=nloc)))
    indexloc=mydataloc$FirmID
    mat1=matrix(indexloc,nrow=nloc,ncol=nloc)
    ownership=(mat1==t(mat1))*1
    mkuploc=-solve(dsdp*ownership)%*%newsj
    diff=max(c(abs(newprice-oldprice),10000*abs(newsj-oldsj)))

    #### New price
    oldprice=newprice
    olddelta=newdelta
    oldsj=newsj
    newprice=newmc+mkuploc
    poll=0
    cpt=cpt+1
  }

  ###### Output #####
  newpax=newsj*popdep
  Deltaprice=newprice-mydataloc$price
  Deltamc=newmc-oldmc
  oldprofit=(mydataloc$price-oldmc)*paxeconomy
  newprofit=(newprice-newmc)*newsj*popdep
  deltaprofit=newprofit-oldprofit
  deltacs=(mydataloc$price-newprice)*paxeconomy+(mydataloc$price-newprice)*newsj*popdep/2
  deltawelfare<-deltacs+deltaprofit

  ret2<-data.frame(newprice=newprice, oldprice=mydataloc$price,newmc=newmc,
                   oldmc=oldmc, oldsj=oldsj, newsj=newsj, newsjg=newsjg,
                   newmkup=mkuploc, newpax=newpax,paxeconomy=paxeconomy,
                   popdep=popdep,lcc=lcc, Deltaprice=Deltaprice,
                   Deltamc=Deltamc,innov=innov, oldprofit=oldprofit,
                   newprofit=newprofit,deltaprofit=deltaprofit,
                   deltacs=deltacs,deltawelfare=deltawelfare,
                   j=j)
  ret2<-as.matrix(ret2)
  return(ret2)
}

##### Define grid of parameters
mcvalues <- seq(-0.1, 0.1, by=0.01)
mcvalues <- mcvalues[mcvalues != 0]  # Exclude 0
dist_values <- seq(400, 800, by=100)  # Distance thresholds
seat_values <- seq(20, 90, by=10)     # Seat thresholds

# Create grid of all combinations
param_grid <- expand.grid(mcchange = mcvalues,
                          dist_threshold = dist_values,
                          seat_threshold = seat_values)

# Initialize summary results data frame
summary_results <- data.frame(
  mcchange = numeric(),
  dist_threshold = numeric(),
  seat_threshold = numeric(),
  totaldeltaprof = numeric(),
  totaldeltacs = numeric(),
  totaldeltawelfare = numeric()
)

# Progress tracking
total_combinations <- nrow(param_grid)
cat("Total combinations to process:", total_combinations, "\n")

### Outer loop for all parameter combinations
for (i in 1:nrow(param_grid)) {
  mcchange_val <- param_grid$mcchange[i]
  dist_val <- param_grid$dist_threshold[i]
  seat_val <- param_grid$seat_threshold[i]

  # Progress indicator
  if (i %% 20 == 0) {
    cat("Processing combination", i, "of", total_combinations, "\n")
  }

  # Initialize totals for this parameter combination
  totaldeltaprof <- 0
  totaldeltacs <- 0
  totaldeltawelfare <- 0

  ## Inner loop for each market "j"
  for (j in 1:maxmarket) {
    # Call the counterfactual function with current parameters
    result <- counterfactual(j, mcchange_val, dist_val, seat_val)
    result <- as.data.frame(result)

    # Accumulate totals across markets
    totaldeltaprof <- totaldeltaprof + sum(result[["deltaprofit"]], na.rm = TRUE)
    totaldeltacs <- totaldeltacs + sum(result[["deltacs"]], na.rm = TRUE)
    totaldeltawelfare <- totaldeltawelfare + sum(result[["deltawelfare"]], na.rm = TRUE)
  }

  # Add results for this parameter combination to summary
  summary_results <- rbind(summary_results,
                          data.frame(
                            mcchange = mcchange_val,
                            dist_threshold = dist_val,
                            seat_threshold = seat_val,
                            totaldeltaprof = totaldeltaprof,
                            totaldeltacs = totaldeltacs,
                            totaldeltawelfare = totaldeltawelfare
                          ))
}

# Write the summary results to CSV
write.csv(summary_results, file = "summary_results_grid.csv", row.names = FALSE)

cat("\nAnalysis complete! Results saved to summary_results_grid.csv\n")
cat("Total rows in output:", nrow(summary_results), "\n")

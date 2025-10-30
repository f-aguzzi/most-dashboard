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


#### Path to be changed ####
#gianmaria
setwd("/Users/gianmariamartini/Library/CloudStorage/GoogleDrive-gianmaria.martini@unibg.it/.shortcut-targets-by-id/189MaPO75puoUggMeS_-QqLgXh3_zZs4S/2024_ELECTRIC/4_Analysis/R/electric")
#andrea
#setwd("G:/Il mio Drive/PC ANDREA/UNIBG/5 - RESEARCH/Scientific Papers/0_My Papers/2 - WP/2024_ELECTRIC/4_Analysis/R/electric")

# Load data ----
mydatainit<- read_dta("dataset_electric_co2_hsr.dta")
names(mydatainit)

##### Add IDs
#rename(mydatainit$region_city_pair,citypair)
names(mydatainit)[names(mydatainit) == "price_economy_def"] <- "price"
#names(mydatainit)[names(mydatainit) == "year"] <- "timeid"
#names(mydatainit)[names(mydatainit) == "fuelcost"] <- "fuelcost_seats"
#mydatainit$fsc=ifelse(mydatainit$lcc == 1,0,1) 
#mydatainit$directfsc=mydatainit$direct*mydatainit$fsc
mydatainit$MkID=as.numeric(factor(paste(mydatainit$market,mydatainit$timeid,sep="-")))
mydatainit$FirmID=as.numeric(factor(mydatainit$opalcodeleg1))
mydata=mydatainit[order(mydatainit$MkID,mydatainit$FirmID),]
mydata$ID=seq(1,nrow(mydata))
nobs=max(mydata$ID)

######## Get vector that holds market-firm combination positions ########
mydata$one<-1
#### Nb products per market and index of the first one
# nbprodbyMkt=c(as.vector(aggregate(list(mydata$one), by = list(mydata$MkID), sum))[,2])
nbprodbyMkt=c(as.vector(aggregate(list(mydata$one), by = list(mydata$MkID), sum))$c)
#cdm[i] index of the first product of Market i
cdm=rep(0,length(nbprodbyMkt))
cdm[1] <-1
for(i in 2:length(nbprodbyMkt)){
  cdm[i] <- cdm[i-1] + nbprodbyMkt[i-1] 
}

#### Nb products per market per firm and index of the first one ########
mydata$combination=paste(mydata$MkID,mydata$FirmID,sep="-")
matproduct=data.table(mydata %>% group_by(combination) %>% summarize(nprod = sum(one), firmshare=sum(sjm), marketmax = max(MkID), 
                                        firm = max(FirmID)))
matindp=matproduct[order(as.numeric(matproduct$marketmax), as.numeric(matproduct$firm)),]

#startm[i] index of the first product proposed by a given firm 
# in a given market
startm=rep(0,nrow(matindp))
startm[1] <-1
for(i in 2:nrow(matindp)){
  startm[i] <- startm[i-1] + matindp$nprod[i-1]
}
mydata <- merge(mydata,matindp,by="combination")
mydata=mydata[order(as.numeric(mydata$MkID),as.numeric(mydata$FirmID)),]
remove(matindp)
remove(matproduct)


#### List of variables and instruments to adapt to our case
#### Demand Estimation ####

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

mydata$arrAOI=0
mydata$arrAOI[mydata$arrairportcode=="AOI"]=1
mydata$arrBDS=0
mydata$arrBDS[mydata$arrairportcode=="BDS"]=1
mydata$arrBGY=0
mydata$arrBGY[mydata$arrairportcode=="BGY"]=1
mydata$arrBLQ=0
mydata$arrBLQ[mydata$arrairportcode=="BLQ"]=1
mydata$arrBRI=0
mydata$arrBRI[mydata$arrairportcode=="BRI"]=1
mydata$arrBZO=0
mydata$arrBZO[mydata$arrairportcode=="BZO"]=1
mydata$arrCAG=0
mydata$arrCAG[mydata$arrairportcode=="CAG"]=1
mydata$arrCIA=0
mydata$arrCIA[mydata$arrairportcode=="CIA"]=1
mydata$arrCIY=0
mydata$arrCIY[mydata$arrairportcode=="CIY"]=1
mydata$arrCRV=0
mydata$arrCRV[mydata$arrairportcode=="CRV"]=1
mydata$arrCTA=0
mydata$arrCTA[mydata$arrairportcode=="CTA"]=1
mydata$arrCUF=0
mydata$arrCUF[mydata$arrairportcode=="CUF"]=1
mydata$arrEBA=0
mydata$arrEBA[mydata$arrairportcode=="EBA"]=1
mydata$arrFCO=0
mydata$arrFCO[mydata$arrairportcode=="FCO"]=1
mydata$arrFLR=0
mydata$arrFLR[mydata$arrairportcode=="FLR"]=1
mydata$arrFRL=0
mydata$arrFRL[mydata$arrairportcode=="FRL"]=1
mydata$arrGOA=0
mydata$arrGOA[mydata$arrairportcode=="GOA"]=1
mydata$arrLIN=0
mydata$arrLIN[mydata$arrairportcode=="LIN"]=1
mydata$arrLMP=0
mydata$arrLMP[mydata$arrairportcode=="LMP"]=1
mydata$arrMXP=0
mydata$arrMXP[mydata$arrairportcode=="MXP"]=1
mydata$arrNAP=0
mydata$arrNAP[mydata$arrairportcode=="NAP"]=1
mydata$arrOLB=0
mydata$arrOLB[mydata$arrairportcode=="OLB"]=1
mydata$arrPEG=0
mydata$arrPEG[mydata$arrairportcode=="PEG"]=1
mydata$arrPMF=0
mydata$arrPMF[mydata$arrairportcode=="PMF"]=1
mydata$arrPMO=0
mydata$arrPMO[mydata$arrairportcode=="PMO"]=1
mydata$arrPNL=0
mydata$arrPNL[mydata$arrairportcode=="PNL"]=1
mydata$arrPSA=0
mydata$arrPSA[mydata$arrairportcode=="PSA"]=1
mydata$arrPSR=0
mydata$arrPSR[mydata$arrairportcode=="PSR"]=1
mydata$arrREG=0
mydata$arrREG[mydata$arrairportcode=="REG"]=1
mydata$arrRMI=0
mydata$arrRMI[mydata$arrairportcode=="RMI"]=1
mydata$arrSUF=0
mydata$arrSUF[mydata$arrairportcode=="SUF"]=1
mydata$arrTPS=0
mydata$arrTPS[mydata$arrairportcode=="TPS"]=1
mydata$arrTRN=0
mydata$arrTRN[mydata$arrairportcode=="TRN"]=1
mydata$arrTRS=0
mydata$arrTRS[mydata$arrairportcode=="TRS"]=1
mydata$arrTSF=0
mydata$arrTSF[mydata$arrairportcode=="TSF"]=1
mydata$arrVBS=0
mydata$arrVBS[mydata$arrairportcode=="VBS"]=1
mydata$arrVCE=0
mydata$arrVCE[mydata$arrairportcode=="VCE"]=1
mydata$arrVRN=0
mydata$arrVRN[mydata$arrairportcode=="VRN"]=1

# dum_arr_air=dummy_cols(mydata$arrairportcode,remove_first_dummy = TRUE)
# name_dum_arr_air=names(dum_arr_air[,2:ncol(dum_arr_air)])
mydata=cbind(mydata,dum_airline[,2:ncol(dum_airline)],dum_month[,2:ncol(dum_month)],
             dum_year[,2:ncol(dum_year)],dum_dep_air[,2:ncol(dum_dep_air)])
remove(dum_airline)
remove(dum_month)
remove(dum_year)
remove(dum_dep_air)
#remove(dum_arr_air)
remove(mydatainit)

#### Instruments, endog and exog. variables

list_instr_demand=c("fuelcost_seat", "comp_products","compdirect_products")
list_endog_demand=c("price", "log_sjconditionalm")

#name_dum_airline,

#### Exogeneous variables ########
list_control_variables=c("direct","dist_od","co2seat_wavg_od","hsr","lcc",
             name_dum_month,name_dum_year,name_dum_dep_air,"arrAOI","arrBDS",
               "arrBGY","arrBLQ","arrBRI","arrBZO","arrCAG","arrCIA",
                       "arrCIY","arrCRV","arrCTA","arrCUF","arrEBA","arrFCO",
                       "arrFLR","arrFRL","arrGOA","arrLIN","arrLMP","arrMXP",
                       "arrNAP","arrOLB","arrPEG","arrPMF","arrPMO","arrPNL",
                       "arrPSA","arrPSR","arrREG","arrRMI","arrSUF","arrTPS",
                       "arrTRN","arrTRS","arrTSF","arrVBS","arrVCE","arrVRN")
# list_control_variables=c("direct","dist_od",name_dum_airline,name_dum_month,
#                         name_dum_year,name_dum_dep_air)

##### 2SLS ######
lhs <- "log_ratio_sjms0m"
ivs <- paste(c(list_instr_demand,list_control_variables), collapse = " + ")
demand_vars <- paste(c(list_endog_demand,list_control_variables), collapse = " + ")

formula <- as.formula(paste(paste(lhs, demand_vars, sep = " ~ "), ivs, sep = " | "))
nliv <- ivreg(formula, data = mydata)

summary(nliv, diagnostics=TRUE)
nliv2<-vcovHC(nliv,type="HC1")
coeftest(nliv,vcov=nliv2)
# summary(nliv, vcov = sandwich, diagnostics = TRUE)
# library(stargazer)
# stargazer(summary(nliv, vcov = sandwich, diagnostics = TRUE))

######################
####### first stage regressions
first_stage_models <- list()

for (var in list_endog_demand) {
  # Estrazione formula primo stadio
  first_stage_formula <- as.formula(paste(var, "~", ivs))
  
  # Stima il primo stadio
  first_stage_models[[var]] <- lm(first_stage_formula, data = mydata)
  
  # Sommario delle stime
  print(summary(first_stage_models[[var]]))
}


# Lista per salvare i risultati del primo stadio
first_stage_models <- list()

# Ciclo su ciascuna variabile endogena
for (var in list_endog_demand) {
  # Crea la formula del primo stadio
  first_stage_formula <- as.formula(paste(var, "~", ivs))
  
  # Stima il modello di primo stadio
  first_stage_models[[var]] <- lm(first_stage_formula, data = mydata)
  
  # Stampa un messaggio chiaro per identificare il modello
  cat("\n=== Primo stadio per variabile endogena:", var, "===\n")
  print(summary(first_stage_models[[var]]))
}

theta0d=nliv$coefficients

##### Some outcomes ########
lambda=1-nliv$coefficients[3]
alpha=-nliv$coefficients[2]
markup<--(lambda)/(-alpha*(1-(1-lambda)*mydata$firmsharenest-(lambda)*mydata$firmshareobs))
mydata$markup<-markup
mydata$mc=(mydata$price-markup)
summary(mydata$mc)
summary(markup)
tapply(mydata$mc,mydata$lcc,mean)
tapply(mydata$mc,mydata$direct,mean)
tapply(markup,mydata$lcc,mean)
tapply(markup,mydata$direct,mean)


#### Price elasticities
## own price 
own_price_elas=-(alpha/lambda)*(mydata$price)*(1-((1-lambda)*mydata$sjconditionalm)-(lambda*mydata$sjm))
mean(own_price_elas)
summary(own_price_elas)
sd(own_price_elas)

## codes for cross
mydata2<-mydata
names(mydata2)<-paste0(names(mydata2),"_")
mydata2$MkID<-mydata2$MkID_
mydata2$MkID_<-NULL
datacross<-merge(mydata2,mydata,by="MkID")
nrow(datacross[datacross$MkID==1,c("arrcitycode","arrcitycode_")])
cross_elasticity=(alpha/lambda)*((datacross$sjm*datacross$price)/datacross$sjm_)*(((1-lambda)*datacross$sjconditionalm_)+lambda*datacross$sjm_)
cross_elasticity[datacross$product_==0]=((alpha*datacross$sjm*datacross$price))
cross_elasticity<-as.data.frame(cross_elasticity)
cross_elasticity$MkID<-datacross$MkID
cross_elasticity$product<-datacross$product
cross_elasticity$product_<-datacross$product_

crosselameanmk<-with(cross_elasticity, aggregate(list(cross_elasticity), by=list(MkID), FUN=mean))
names(crosselameanmk)[1] <- "Market"
names(crosselameanmk)[2]<-"Crossela"
summary(crosselameanmk$Crossela)
sd(crosselameanmk$Crossela)

# ho due scelte: 1) in questo dataset nel cross elas metto anche le own 2) non le metto

######## Supply estimates ########
lhs <- "mc"
# mydata$gatewayhub_fsc<-mydata$gatewayhub*mydata$fsc
# list_variables_supply=c("direct","fuelcost_seat",name_dum_airline,name_dum_month,
   #                     name_dum_year,name_dum_dep_air,"arrAOI","arrBDS",
  #                      "arrBGY","arrBLQ","arrBRI","arrBZO","arrCAG","arrCIA",
  #                      "arrCIY","arrCRV","arrCTA","arrCUF","arrEBA","arrFCO",
  #                      "arrFLR","arrFRL","arrGOA","arrLIN","arrLMP","arrMXP",
  #                      "arrNAP","arrOLB","arrPEG","arrPMF","arrPMO","arrPNL",
  #                      "arrPSA","arrPSR","arrREG","arrRMI","arrSUF","arrTPS",
  #                      "arrTRN","arrTRS","arrTSF","arrVBS","arrVCE","arrVRN")
# list_variables_supply=c("direct","fuelcost_seat",name_dum_airline,name_dum_month,
      #                  name_dum_year)
list_variables_supply=c("direct","fuelcost_seat",name_dum_airline,
                        name_dum_year,name_dum_dep_air,"arrAOI","arrBDS",
                        "arrBGY","arrBLQ","arrBRI","arrBZO","arrCAG","arrCIA",
                        "arrCIY","arrCRV","arrCTA","arrCUF","arrEBA","arrFCO",
                        "arrFLR","arrFRL","arrGOA","arrLIN","arrLMP","arrMXP",
                        "arrNAP","arrOLB","arrPEG","arrPMF","arrPMO","arrPNL",
                        "arrPSA","arrPSR","arrREG","arrRMI","arrSUF","arrTPS",
                        "arrTRN","arrTRS","arrTSF","arrVBS","arrVCE","arrVRN")
formula <- as.formula(paste(lhs, paste(list_variables_supply, collapse = " + "), sep = " ~ "))
supply_est<-lm(formula,data=mydata)
summary(supply_est)

supply_est2<-vcovHC(supply_est,type="HC1")
coeftest(supply_est,vcov=supply_est2)

theta0s=supply_est$coefficients
theta0=c(theta0d,theta0s)

# exporting estimates in latex (da controllare e finire)
texreg(list(nliv,supply_est), file = "structural_results_25_10_24.tex",
       caption = "Econometric estimates from structural model",
       custom.model.names = c("Demand", "Supply"),
       digits = 4, stars = c(0.01,0.05,0.1))

################################################################################
################### GMM estimation ####################
################################################################################

#### GMM function #####
#### Add 1 for the constant term in the FOC
nd=length(c(list_endog_demand,list_control_variables))+1
ns=length(list_variables_supply)+1

################################################################################
mean_moment<-function(theta){
  theta_d=theta[1:nd]
  theta_s=theta[(nd+1):(nd+ns)]
  
  #### Demand equations
  mat_d=as.matrix(cbind(1,mydata[c(list_endog_demand,list_control_variables)]))
  xi=mydata$log_ratio_sjms0m-mat_d%*%theta_d
  Z_d=as.matrix(cbind(1,mydata[c(list_instr_demand,list_control_variables)]))
  xi_d=matrix(xi,nrow=nobs,ncol=ncol(Z_d))
  mean_d=apply(Z_d*xi_d,2,mean)
  
  
  ### Supply side, only alpha and lambda matter
  lambdaloc=1-theta_d[3]
  alphaloc=-theta_d[2]
  #markuploc=-lambdaloc/alphaloc/((1-lambdaloc)*mydata$firmsharenest/(1-mydata$s0m)+lambdaloc*mydata$marketshare_firm_obs-1)
  markuploc=-(lambdaloc)/(-alphaloc*(1-(1-lambdaloc)*mydata$firmsharenest-lambdaloc*mydata$firmshareobs))
  mc=(mydata$price-markuploc)
  mat_s=as.matrix(cbind(1,mydata[list_variables_supply]))
  psi=mc-mat_s%*%theta_s
  Z_s=mat_s
  psi_s=matrix(psi,nrow=nrow(Z_s),ncol=ncol(Z_s))
  mean_s=apply(Z_s*psi_s,2,mean)
  
  #### Mean_moment ###
  m=as.vector(c(mean_d,mean_s))
  return(m)
}
################################################################################
varmom<-function(theta){
  theta_d=theta[1:nd]
  theta_s=theta[(nd+1):(nd+ns)]
  
  #### Demand equations
  mat_d=as.matrix(cbind(1,mydata[c(list_endog_demand,list_control_variables)]))
  xi=mydata$log_ratio_sjms0m-mat_d%*%theta_d
  Z_d=as.matrix(cbind(1,mydata[c(list_instr_demand,list_control_variables)]))
  xi_d=matrix(xi,nrow=nobs,ncol=ncol(Z_d))
  momd=Z_d*xi_d
  
  ### Supply side, only alpha and lambda matter
  lambdaloc=1-theta_d[3]
  alphaloc=-theta_d[2]
  #markuploc=-lambdaloc/alphaloc/((1-lambdaloc)*mydata$marketshare_firm_nest/(1-mydata$s0m)+lambdaloc*mydata$marketshare_firm_obs-1)
  markuploc=-(lambdaloc)/(-alphaloc*(1-(1-lambdaloc)*mydata$firmsharenest-lambdaloc*mydata$firmshareobs))
  mc=(mydata$price-markuploc)
  mat_s=as.matrix(cbind(1,mydata[list_variables_supply]))
  psi=mc-mat_s%*%theta_s
  Z_s=mat_s
  psi_s=matrix(psi,nrow=nrow(Z_s),ncol=ncol(Z_s))
  moms=Z_s*psi_s
  
  ####M(X_i,\theta) ### nobs x (nd+ns)
  mom=cbind(momd,moms)
  
  ### Estimated var 
  mombar=apply(mom,2,mean)
  estvar=(t(mom)%*%mom)/nobs-mombar%*%t(mombar)
  return(estvar)
}
################################################################################
meandmdtheta<-function(theta){
  theta_d=theta[1:nd]
  theta_s=theta[(nd+1):(nd+ns)]
  #### First derivative with respect to the coefficients beta (excluding alpha and lambda)
  mat_d=as.matrix(cbind(1,mydata[c(list_endog_demand,list_control_variables)]))
  Z_d=as.matrix(cbind(1,mydata[c(list_instr_demand,list_control_variables)]))
  ### Supply side
  mat_s=as.matrix(cbind(1,mydata[list_variables_supply]))
  Z_s=mat_s
  ###### matm0 is the matrix
  matm0=matrix(0,nrow=ncol(Z_d)+ncol(Z_s),ncol=nd+ns)
  matm0[1:ncol(Z_d),1:nd]=-(t(Z_d)%*%mat_d)/nobs
  matm0[(ncol(Z_d)+1):(ncol(Z_d)+ncol(Z_s)),(nd+1):(nd+ns)]=-(t(Z_s)%*%Z_s)/nobs
  ###Specific formula for dmdalpha and dmdlambda
  lambdaloc=1-theta_d[3]
  alphaloc=-theta_d[2]
  #markuploc=as.vector(-lambdaloc/alphaloc/((1-lambdaloc)*mydata$marketshare_firm_nest/(1-mydata$s0m)+lambdaloc*mydata$marketshare_firm_obs-1))
  markuploc=as.vector(-(lambdaloc)/(-alphaloc*(1-(1-lambdaloc)*mydata$firmsharenest-lambdaloc*mydata$firmshareobs)))
  #dmdalpha for the last rows
  matm0[(ncol(Z_d)+1):(ncol(Z_d)+ncol(Z_s)),2]=(-1/alphaloc)*(t(Z_s)%*%markuploc)/nobs
  #dmdlambda for the last rows
  #Dm=as.vector(1/((1-lambdaloc)*mydata$firmshare/(1-mydata$s0m)+lambdaloc*mydata$firmshare-1))
  Dm=as.vector(1/(1-(1-lambdaloc)*mydata$firmsharenest-lambdaloc*mydata$firmshareobs))
  #dermkupdl=markuploc/lambdaloc+(mydata$firmshare*mydata$s0m*markuploc*Dm)/(1-mydata$s0m)
  dermkupdl=(markuploc/lambdaloc)-markuploc*(mydata$firmsharenest-mydata$firmshareobs)*Dm
  matm0[(ncol(Z_d)+1):(ncol(Z_d)+ncol(Z_s)),3]=(t(Z_s)%*%dermkupdl)/nobs
  return(matm0)
}
################################################################################
###### GMM with identity weighting matrix
GMM1<-function(theta){
  m=mean_moment(theta)
  gtheta=t(m)%*%m
  return(gtheta)
}
################################################################################
#### Initial value for GMM and bounds for optim
theta.init=theta0
nparam=length(theta.init)
lb0=rep(-Inf,nparam)
ub0=rep(+Inf,nparam)
ub0[2]=-1e-5
lb0[3]=1e-10
ub0[3]=1-1e-10  

######### Basic GMM #########
Estim_NL_ID <- nloptr(x0 = theta.init,
                   eval_f = GMM1,
                   eval_grad_f = NULL,
                   lb=lb0,
                   ub=ub0,
                   opts = list("algorithm"="NLOPT_LN_BOBYQA",
                               ftol_rel = 1.e-7, ftol_abs = 1.e-9, 
                               xtol_rel = 1.e-7, xtol_abs = 0, 
                               maxeval = 100000, "print_level"=2)
                   )
GMM1(theta.init)
thetafin=Estim_NL_ID$solution
GMM1(thetafin)


##### Standard errors
W=diag(length(c(list_instr_demand,list_control_variables))+1+ns)
Gm=meandmdtheta(thetafin)

Varm=varmom(thetafin)
Mat1=spdinv(t(Gm)%*%W%*%Gm)

Variance_thetafin=(Mat1%*%t(Gm)%*%W%*%Varm%*%W%*%Gm%*%Mat1)/nobs
cbind(theta.init,thetafin,sqrt(diag(Variance_thetafin)))

######### Optimal two step GMM #########
#theta.init2=thetafin
#epsilon<-0.0001
#W2=spdinv(Varm)
#W2=spdinv(Varm+epsilon*diag(220))

#GMM2<-function(theta){
#  m=mean_moment(theta)
#  gtheta=t(m)%*%W2%*%m
#  return(gtheta)
#}

#Estim_2SGMM <- nloptr(x0 = theta.init2,
#                      eval_f = GMM2,
#                      eval_grad_f = NULL,
#                      lb=lb0,
#                      ub=ub0,
#                      opts = list("algorithm"="NLOPT_LN_BOBYQA",
#                                  ftol_rel = 1.e-7, ftol_abs = 1.e-9, 
#                                  xtol_rel = 1.e-7, xtol_abs = 0, 
#                                  maxeval = 1, "print_level"=2)
#)
#GMM2(theta.init2)
#thetafin2=Estim_2SGMM$solution
#GMM2(thetafin2)


##### Standard errors
#Gm2=meandmdtheta(thetafin2)
#Mat2=spdinv(t(Gm2)%*%W2%*%Gm2)
#Variance_thetafin2=Mat2/nobs

#cbind(theta.init,thetafin,sqrt(diag(Variance_thetafin)),thetafin2,sqrt(diag(Variance_thetafin2)))

######### Optimal two step GMM + regularisation  #########
theta.init3=thetafin
W3=spdinv(Varm+0.01*diag(length(c(list_instr_demand,list_control_variables))+1+ns))

GMM3<-function(theta){
  m=mean_moment(theta)
  gtheta=t(m)%*%W3%*%m
  return(gtheta)
}

Estim_2SGMMR <- nloptr(x0 = theta.init3,
                      eval_f = GMM3,
                      eval_grad_f = NULL,
                      lb=lb0,
                      ub=ub0,
                      opts = list("algorithm"="NLOPT_LN_BOBYQA",
                                  ftol_rel = 1.e-7, ftol_abs = 1.e-9, 
                                  xtol_rel = 1.e-7, xtol_abs = 0, 
                                  maxeval = 100000, "print_level"=2)
)
GMM3(theta.init3)
thetafin3=Estim_2SGMMR$solution
GMM3(thetafin3)


##### Standard errors
Gm3=meandmdtheta(thetafin3)
Mat3=spdinv(t(Gm3)%*%W3%*%Gm3)
Varm3=varmom(thetafin3)

Variance_thetafin3=(Mat3%*%t(Gm3)%*%W3%*%Varm3%*%W3%*%Gm3%*%Mat3)/nobs

#modelfirst<-summary(nliv)
#sterrornliv<-modelfirst$coefficients[,"Std. Error"]
#toto1=summary(nliv, vcov = nliv2, diagnostics = TRUE)

nomicoef<-c("const",list_endog_demand,list_control_variables,"const",list_variables_supply)
names(thetafin3)<-nomicoef

#matoutput=cbind(theta.init,thetafin,thetafin2,thetafin3,sqrt(diag(Variance_thetafin3)),sqrt(diag(Variance_thetafin2)),sqrt(diag(Variance_thetafin)),sqrt(c(diag(toto1$vcov),diag(vcov(supply_est)))))
#colnames(matoutput)=c("Theta.2steps", "Theta.GMM_Id","Theta.2SGMM","Theta.2SGMMR","Std.2SGMMR","Std.2SGMM","Std.GMM_Id","Std_2steps")
matoutput=cbind(theta.init,thetafin,thetafin3,sqrt(diag(Variance_thetafin3)),sqrt(diag(Variance_thetafin)))
colnames(matoutput)=c("Theta_sep","Theta_GMM","Theta_2SGMMR","Std.2SGMMR","Std.GMM_Id")
#matoutput=cbind(theta.init,thetafin,thetafin2,thetafin3,sqrt(diag(Variance_thetafin3)),sqrt(diag(Variance_thetafin2)),sqrt(diag(Variance_thetafin)),c(sterrornliv,sqrt(diag(vcov(supply_est)))))
#colnames(matoutput)=c("Theta.2steps","Theta.GMM_Id","Theta.2SGMM","Theta.2SGMMR","Std.2SGMMR","Std.2SGMM","Std.GMM_Id","Std_2steps")

write.csv(matoutput,"Demand_and_supply_estimates_GMM_08_nov_2024.csv")
write.csv(matoutput,"Demand_and_supply_estimates_GMM_11_dic_2024.csv") 
############################################################
############### Counterfactual ###############
############################################################
############### We decrease/increase marginal costs of airlines adopting electric
# aircraft under different scenarios, and we fix in any case their CO2
# equal to 0 in the demand model
theta0=thetafin3
nd=length(c(list_endog_demand,list_control_variables))+1
ns=length(list_variables_supply)+1
theta_d=theta0[1:nd]
#theta_d=theta0d
theta_s=theta0[(nd+1):(nd+ns)]
#theta_s=theta0s
lambda=1-theta_d[3]
alpha=-theta_d[2]
poll=theta_d[6]
seats<-mydata$fuelcost/mydata$fuelcost_seat
mydata$seats<-seats
# number of market in each loop
maxmarket=max(mydata$MkID)

##### Inner loop on markets #####
# for (j in (1:maxmarket)){
counterfactual <-function(j, mcchange){
  mydataloc=mydata[mydata$MkID==j,]
  nloc=nrow(mydataloc)
  oldprice=mydataloc$price
  oldsj=mydataloc$sjm
  #oldsj=mydataloc$sjm
  olds0=mydataloc$s0m
  paxeconomy=mydataloc$pax_economy
  popdep=mydataloc$pop_dep
  lcc<-mydataloc$lcc
  #### Demand equations
  mat_d=as.matrix(cbind(1,mydataloc[c(list_endog_demand,list_control_variables)]))
  oldxi=mydataloc$log_ratio_sjms0m-mat_d%*%theta_d
  olddelta=mat_d%*%theta_d+oldxi-theta_d[3]*mydataloc$log_sjconditionalm
  ### New marginal cost
  markuploc=-(lambda)/(-alpha*(1-(1-lambda)*mydataloc$firmsharenest-lambda*mydataloc$firmshareobs))
  oldmc=(mydataloc$price-markuploc)
  innov=rep(0,nloc)
  innov[(mydataloc$dist_od<=400) & (mydataloc$seats<=21)]=1
  #newmc=oldmc-.05*oldmc*minusmc
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
#    dsdp=-(alpha/lambda)*matsk*(diag(1,nloc)*(1-matrix(c((1-lambda)*newsjg+lambda*newsj),nrow=nloc,ncol=nloc)))
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
  #newnbpaxFSC=sum(newsj*mydataloc$fsc)*mydataloc$dep_pop[1]
  #oldnbpaxFSC=sum(mydataloc$pax*mydataloc$fsc)
  #Deltaprice=mean(newprice-mydataloc$price)
  #Deltamc=mean(newmc-oldmc)
  Deltaprice=newprice-mydataloc$price
  Deltamc=newmc-oldmc
  oldprofit=(mydataloc$price-oldmc)*paxeconomy
  newprofit=(newprice-newmc)*newsj*popdep
  deltaprofit=newprofit-oldprofit
  #totaloldprof<-sum(oldprofit)
  #totalnewprof<-sum(newprofit)
  
  #totaldeltaprof<-sum(deltaprofit)
  #totaldeltaprof<-totaldeltaprof
  deltacs=(mydataloc$price-newprice)*paxeconomy+(mydataloc$price-newprice)*newsj*popdep/2
  
  #totaldeltacs<-sum(deltacs)
  #dati_counter$totaldeltacs<-totaldeltacs
  deltawelfare<-deltacs+deltaprofit
  
  #totaldeltawelfare<-sum(deltawelfare)
  #dati_counter$totaldeltawelfare<-totaldeltawelfare
  #passthrough=Deltaprice/Deltamc
  #passthrough=as.numeric(ifelse(innov==1,Deltaprice/Deltamc,"NA"))
  #DeltapriceFSC=mean((newprice-mydataloc$price)*mydataloc$fsc)/(mean(mydataloc$fsc))
  #Deltapax=newnbpax-oldnbpax
  #DeltapaxFSC=newnbpaxFSC-oldnbpaxFSC
  #ret1 is the original returned result
  #ret1<-c(j,oldnbpaxLCC,newnbpaxLCC,DeltapaxLCC,oldnbpaxFSC,newnbpaxFSC,DeltapaxFSC,DeltapriceLCC,DeltapriceFSC)
  
  ret2<-data.frame(newprice=newprice, oldprice=mydataloc$price,newmc=newmc, 
                   oldmc=oldmc, oldsj=oldsj, newsj=newsj, newsjg=newsjg, 
                   newmkup=mkuploc, newpax=newpax,paxeconomy=paxeconomy,
                   popdep=popdep,lcc=lcc, Deltaprice=Deltaprice,
                   Deltamc=Deltamc,innov=innov, oldprofit=oldprofit,
                   newprofit=newprofit,deltaprofit=deltaprofit,
                   deltacs=deltacs,deltawelfare=deltawelfare,
                   #passthrough,
                   #DeltapriceFSC=DeltapriceFSC,
                   j=j)
  ret2<-as.matrix(ret2)
  # per riportare il vecchio codice return(ret1)
  return(ret2)
}

##### Loop on mcchange
# mcvalues for the loop on mc changes
mcvalues<-seq(0.01,0.1, by=0.01)
mcvalues <- mcvalues[mcvalues != 0]  # Escludi il valore 0
# Initialize storage for results
all_market_results <- list()

### Outer loop for mcchange values
for (mcchange in mcvalues) {
  # Initialize totaldeltaprof for this mcchange
  totaldeltaprof <- 0
  totaldeltacs <- 0
  totaldeltawelfare <- 0
  ## Inner loop for each market "j"
  for (j in 1:maxmarket) {
  # call the counterfactual function and store the results
    result<-counterfactual(j,mcchange)
  # Convert result to a data frame to allow adding new columns
    result <- as.data.frame(result)
  # Accumulate deltaprofit, deltacs and deltawelfare across markets for this mcchange
    totaldeltaprof <- totaldeltaprof + sum(result[["deltaprofit"]],na.rm = TRUE)  
    totaldeltacs <- totaldeltacs + sum(result[["deltacs"]],na.rm = TRUE)  
    totaldeltawelfare <- totaldeltawelfare + sum(result[["deltawelfare"]],na.rm = TRUE)  
  # Add mcchange and market index j to each result
    result$mcchange <- mcchange
    result$j <- j
  # Save each market result in the list with a unique keys
    all_market_results[[paste0("mcchange_", mcchange, "_j_", j)]] <- result  
  }
  # After processing all markets, we now add totaldeltaprof, totaldeltacs 
  # and totaldeltawelfare to all results for this mcchange
  for (j in 1:maxmarket) {
    # Retrieve the result for this mcchange and market j
    result_key <- paste0("mcchange_", mcchange, "_j_", j)
    result <- all_market_results[[result_key]]
    # Add totaldeltaprof to the result for this market
    result$totaldeltaprof <- totaldeltaprof
    result$totaldeltacs <- totaldeltacs
    result$totaldeltawelfare <- totaldeltawelfare
    # Update the result in the list
    all_market_results[[result_key]] <- result
  }
}  

# Combine all results into a single data frame
  all_results_df <- do.call(rbind, all_market_results)
  
# Convert to a matrix if needed
all_results_matrix <- as.matrix(all_results_df)

# Write the data frame to a  csv file
# scenario 400
write.csv(all_results_df, file = "all_results_matrix_400_dic_2024.csv")

# scenario 800
write.csv(all_results_df, file = "all_results_matrix_800.csv")

########################
##### load the counterfactual scenarios
# scenario 400
all_results_df <- read.csv("all_results_matrix_400_001_01.csv")

# scenario 800
all_results_df <- read.csv("all_results_matrix_800.csv")

########################
####### Computation for each mcchange of the mean of deltaprice deltamc
####### only in the markets where innov==1

# Inizializza un data frame per salvare i risultati medi e passth
average_results <- data.frame(mcchange = numeric(), 
                              mean_deltaprice = numeric(), 
                              mean_deltamc = numeric(),
                              passth = numeric())

# Ciclo sui valori di mcchange
# Scenario 400
# mcvalues for the loop on mc changes
mcvalues<-seq(0.01,0.1, by=0.01)
mcvalues <- mcvalues[mcvalues != 0]  # Escludi il valore 0

# Scenario 800
# mcvalues for the loop on mc changes
# mcvalues for the loop on mc changes
mcvalues<-seq(-0.1,0.1, by=0.01)
mcvalues <- mcvalues[mcvalues != 0]  # Escludi il valore 0

for (mcchange in mcvalues) {
  # Estrai tutti i risultati per l'attuale mcchange
  results_for_mcchange <- do.call(rbind, lapply(all_market_results, function(x) {
    if (x$mcchange[1] == mcchange) return(as.data.frame(x))
  }))
  
  # Filtra i mercati con innov == 1
  results_with_innov <- subset(results_for_mcchange, innov == 1)
  
  # Calcola la media di Deltaprice e Deltamc
  mean_deltaprice <- mean(results_with_innov$Deltaprice, na.rm = TRUE)
  mean_deltamc <- mean(results_with_innov$Deltamc, na.rm = TRUE)
  
  # Calcola passth come rapporto tra mean_deltaprice e mean_deltamc
  passth <- ifelse(mean_deltamc != 0, mean_deltaprice / mean_deltamc, NA)
  
  # Aggiungi i risultati al data frame
  average_results <- rbind(average_results, 
                           data.frame(mcchange = mcchange, 
                                      mean_deltaprice = mean_deltaprice, 
                                      mean_deltamc = mean_deltamc,
                                      passth = passth))
}

# Visualizza i risultati
print(average_results)

########################
############ Conta quante sono le innovazioni e 
############ quante LCC fanno le innovazioni (basta un valore di mcchange)
# Scenario 400
# Filtra i dati per mcchange == 0.01
filtered_data <- subset(all_results_df, mcchange == 0.01)

# Scenario 800
# Filtra i dati per mcchange == -0.10
filtered_data <- subset(all_results_df, mcchange == -0.10)

# Count the total number of innovations (where innov == 1)
total_innovations <- sum(filtered_data$innov == 1, na.rm = TRUE)

# Count the number of innovations by LCCs (where innov == 1 and lcc == 1)
lcc_innovations <- sum(filtered_data$innov == 1 & filtered_data$lcc == 1, na.rm = TRUE)

# Print the results
cat("Total innovations:", total_innovations, "\n")
cat("Innovations by LCCs:", lcc_innovations, "\n")

#############################
############# calcolo il delta profitti di chi innova
# Inizializza un data frame per salvare i risultati medi e la somma
average_and_sum_deltaprofit <- data.frame(
  mcchange = numeric(), 
  mean_deltaprofit = numeric(), 
  sum_deltaprofit = numeric(),
  mean_deltaprofitlcc = numeric(),
  sum_deltaprofitlcc = numeric(),
  mean_deltaprofitfsc = numeric(),
  sum_deltaprofitfsc = numeric()
)

# Ciclo sui valori di mcchange
for (mcchange_value in mcvalues) {
  # Filtra i dati per mcchange corrente e innov == 1
  filtered_data <- subset(all_results_df, mcchange == mcchange_value & innov == 1)
  
  # Calcola le medie e le somme di deltaprofit per innov == 1
  mean_deltaprofit <- mean(filtered_data$deltaprofit, na.rm = TRUE)
  sum_deltaprofit <- sum(filtered_data$deltaprofit, na.rm = TRUE)
  
  # Filtra ulteriormente per LCC (lcc == 1)
  filtered_lcc <- subset(filtered_data, lcc == 1)
  mean_deltaprofitlcc <- mean(filtered_lcc$deltaprofit, na.rm = TRUE)
  sum_deltaprofitlcc <- sum(filtered_lcc$deltaprofit, na.rm = TRUE)
  
  # Filtra ulteriormente per FSC (lcc == 0)
  filtered_fsc <- subset(filtered_data, lcc == 0)
  mean_deltaprofitfsc <- mean(filtered_fsc$deltaprofit, na.rm = TRUE)
  sum_deltaprofitfsc <- sum(filtered_fsc$deltaprofit, na.rm = TRUE)
  
  # Aggiungi i risultati al data frame
  average_and_sum_deltaprofit <- rbind(average_and_sum_deltaprofit, 
                                       data.frame(mcchange = mcchange_value, 
                                                  mean_deltaprofit = mean_deltaprofit,
                                                  sum_deltaprofit = sum_deltaprofit,
                                                  mean_deltaprofitlcc = mean_deltaprofitlcc,
                                                  sum_deltaprofitlcc = sum_deltaprofitlcc,
                                                  mean_deltaprofitfsc = mean_deltaprofitfsc,
                                                  sum_deltaprofitfsc = sum_deltaprofitfsc))
}

# Visualizza i risultati
print(average_and_sum_deltaprofit)

################ some graphs
# Carica librerie necessarie
library(ggplot2)
library(gridExtra)

# Grafico per mean_deltaprofit
plot_mean_profit <- ggplot(average_and_sum_deltaprofit, aes(x = factor(mcchange), y = mean_deltaprofit, group = 1)) +
  geom_line(color = "blue", size = 1) +
  geom_point(color = "blue", size = 3) +
  labs(title = "Mean Deltaprofit",
       x = "MCChange",
       y = "Mean Deltaprofit") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# Grafico per sum_deltaprofit
plot_sum_profit <- ggplot(average_and_sum_deltaprofit, aes(x = factor(mcchange), y = sum_deltaprofit, group = 1)) +
  geom_line(color="red", size = 1) +
  geom_point(color="red", size = 3) +
  labs(title = "Sum of Deltaprofit",
       x = "MCChange",
       y = "Sum Deltaprofit (,000)") +
  scale_y_continuous(labels = scales::label_number(scale = 0.001, suffix = "k")) +
  scale_color_manual(values = c("Sum Deltaprofit" = "red")) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1), legend.position = "none")

# Grafico per mean_deltaprofitlcc
plot_mean_profitlcc <- ggplot(average_and_sum_deltaprofit, aes(x = factor(mcchange), y = mean_deltaprofitlcc, group = 1)) +
  geom_line(color = "green", size = 1) +
  geom_point(color = "green", size = 3) +
  labs(title = "Mean Deltaprofit LCC",
       x = "MCChange",
       y = "Mean Deltaprofit LCC") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# Grafico per sum_deltaprofitlcc
plot_sum_profitlcc <- ggplot(average_and_sum_deltaprofit, aes(x = factor(mcchange), y = sum_deltaprofitlcc, group = 1, color = "Sum Deltaprofit LCC")) +
  geom_line(color="purple", size = 1) +
  geom_point(color= "purple", size = 3) +
  labs(title = "Sum of Deltaprofit (LCC)",
       x = "MCChange",
       y = "Sum Deltaprofit (,000)",
       color = "Legend") +
  scale_y_continuous(labels = scales::label_number(scale = 0.001, suffix = "k")) +
  scale_color_manual(values = c("Sum Deltaprofit LCC" = "blue")) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1), legend.position = "none")

# Grafico per mean_deltaprofitfsc
plot_mean_profitfsc <- ggplot(average_and_sum_deltaprofit, aes(x = factor(mcchange), y = mean_deltaprofitfsc, group = 1)) +
  geom_line(color = "orange", size = 1) +
  geom_point(color = "orange", size = 3) +
  labs(title = "Mean Deltaprofit FSC",
       x = "MCChange",
       y = "Mean Deltaprofit FSC") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# Grafico per sum_deltaprofitfsc
plot_sum_profitfsc <- ggplot(average_and_sum_deltaprofit, aes(x = factor(mcchange), y = sum_deltaprofitfsc, group = 1, color = "Sum Deltaprofit FSC")) +
  geom_line(size = 1, color="cyan") +
  geom_point(size = 3,color="cyan") +
  labs(title = "Sum of Deltaprofit (FSC)",
       x = "MCChange",
       y = "Sum Deltaprofit (,000)",
       color = "Legend") +
  scale_y_continuous(labels = scales::label_number(scale = 0.001, suffix = "k")) +
  scale_color_manual(values = c("Sum Deltaprofit FSC" = "green")) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1), legend.position = "none")

# Scenario 400
profits_plots_400<-grid.arrange(plot_mean_profit, plot_sum_profit,
                            plot_mean_profitfsc, plot_sum_profitfsc,
                            ncol = 2)

# Scenario 800
# Disporre i grafici in un layout 2x3
profits_plots<-grid.arrange(plot_mean_profit, plot_sum_profit,
             plot_mean_profitlcc, plot_sum_profitlcc,
             plot_mean_profitfsc, plot_sum_profitfsc,
             ncol = 2)

# Specify the file path
# Scenario 400
output_path <- "/Users/gianmariamartini/Library/CloudStorage/Dropbox/Ricerca/settore_aereo/electric/graphs/profits_plots_400.jpeg"

# Save the combined plot
ggsave(
  filename = output_path, plot = profits_plots_400,
  width = 14,   # Adjust width as needed
  height = 7,   # Adjust height as needed
  units = "in", # Units can be "in", "cm", or "mm"
  dpi = 300     # Adjust DPI for high-quality image
)

# Scenario 800
output_path <- "/Users/gianmariamartini/Library/CloudStorage/Dropbox/Ricerca/settore_aereo/electric/graphs/profits_plots.jpeg"

# Save the combined plot
ggsave(
  filename = output_path, plot = profits_plots,
       width = 14,   # Adjust width as needed
       height = 7,   # Adjust height as needed
       units = "in", # Units can be "in", "cm", or "mm"
       dpi = 300     # Adjust DPI for high-quality image
  )

#########
#### grafici per total cs profit e welfare
# Estrarre i valori alla posizione [1] per ogni mcchange
totals_subset <- all_results_df %>%
  group_by(mcchange) %>%
  slice(1) %>%
  ungroup() %>% # Rimuove il grouping per semplificare
  dplyr::select(mcchange, totaldeltacs, totaldeltaprof, totaldeltawelfare)

# Determina il limite massimo comune per l'asse y
max_y_value <- max(c(totals_subset$totaldeltacs, totals_subset$totaldeltaprof), na.rm = TRUE)
# Determina il minimo comune (anche negativo) tra due colonne
min_y_value <- min(c(totals_subset$totaldeltacs, totals_subset$totaldeltaprof), na.rm = TRUE)

# Stampa il risultato
print(max_y_value)
print(min_y_value)

# Scenario 400

# Plot Total Delta CS
plot_totaldeltacs <- ggplot(totals_subset, aes(x = factor(mcchange), y = totaldeltacs)) +
  geom_bar(stat = "identity", fill = "blue", color = "black", width = 0.7) +
  labs(title = "Total Delta CS",
       x = "MCChange",
       y = "Total Delta CS (Millions)") +
  scale_y_continuous(labels = scales::label_number(scale = 1e-6, suffix = "M")) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# Plot Total Delta Profit
plot_totaldeltaprof <- ggplot(totals_subset, aes(x = factor(mcchange), y = totaldeltaprof)) +
  geom_bar(stat = "identity", fill = "red", color = "black", width = 0.7) +
  labs(title = "Total Delta Profit",
       x = "MCChange",
       y = "Total Delta Profit (Millions)") +
  scale_y_continuous(labels = scales::label_number(scale = 1e-6, suffix = "M")) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1), legend.position = "none")

# Plot Total Delta Welfare
plot_totaldeltawelfare <- ggplot(totals_subset, aes(x = factor(mcchange), y = totaldeltawelfare, fill = "Total Delta Welfare")) +
  geom_bar(stat = "identity", width = 0.7, color = "black") +
  labs(title = "Total Delta Welfare",
       x = "MCChange",
       y = "Total Delta Welfare (Millions)") +
  scale_y_continuous(labels = scales::label_number(scale = 1e-6, suffix = "M")) +
  scale_fill_manual(values = c("Total Delta Welfare" = "green")) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1), legend.position = "none")

# Arrange the plots in a grid
welfare_plots_400 <- grid.arrange(plot_totaldeltacs, plot_totaldeltaprof, plot_totaldeltawelfare, ncol = 3)

# Specify the file path
output_path <- "/Users/gianmariamartini/Library/CloudStorage/Dropbox/Ricerca/settore_aereo/electric/graphs/welfare_plots_400.jpeg"

# Save the combined plot
ggsave(
  filename = output_path, plot = welfare_plots_400,
  width = 14,   # Adjust width as needed
  height = 7,   # Adjust height as needed
  units = "in", # Units can be "in", "cm", or "mm"
  dpi = 300     # Adjust DPI for high-quality image
)

# Scenario 800
# Grafico per totaldeltacs con asse y in milioni e senza legenda
plot_totaldeltacs <- ggplot(totals_subset, aes(x = factor(mcchange), y = totaldeltacs, fill = "Total Delta CS")) +
  geom_bar(stat = "identity", width = 0.7, color = "black") +
  labs(title = "Total Delta CS",
       x = "MCChange",
       y = "Total Delta CS (Millions)") +
  scale_y_continuous(labels = scales::label_number(scale = 1e-6, suffix = "M"), limits = c(min_y_value, max_y_value)) +
  scale_fill_manual(values = c("Total Delta CS" = "blue")) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1), legend.position = "none")

# Grafico per totaldeltaprof con asse y in milioni e senza legenda
plot_totaldeltaprof <- ggplot(totals_subset, aes(x = factor(mcchange), y = totaldeltaprof, fill = "Total Delta Profit")) +
  geom_bar(stat = "identity", width = 0.7, color = "black") +
  labs(title = "Total Delta Profit",
       x = "MCChange",
       y = "Total Delta Profit (Millions)") +
  scale_y_continuous(labels = scales::label_number(scale = 1e-6, suffix = "M"), limits = c(min_y_value, max_y_value)) +
  scale_fill_manual(values = c("Total Delta Profit" = "red")) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1), legend.position = "none")

# Grafico per totaldeltawelfare con asse y in milioni e senza legenda (senza scala condivisa)
plot_totaldeltawelfare <- ggplot(totals_subset, aes(x = factor(mcchange), y = totaldeltawelfare, fill = "Total Delta Welfare")) +
  geom_bar(stat = "identity", width = 0.7, color = "black") +
  labs(title = "Total Delta Welfare",
       x = "MCChange",
       y = "Total Delta Welfare (Millions)") +
  scale_y_continuous(labels = scales::label_number(scale = 1e-6, suffix = "M")) +
  scale_fill_manual(values = c("Total Delta Welfare" = "green")) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1), legend.position = "none")

# Unire i grafici in un layout a 3 colonne
welfare_plots <- grid.arrange(plot_totaldeltacs, plot_totaldeltaprof, plot_totaldeltawelfare, ncol = 3)

# Specify the file path
output_path <- "/Users/gianmariamartini/Library/CloudStorage/Dropbox/Ricerca/settore_aereo/electric/graphs/welfare_plots.jpeg"

# Save the combined plot
ggsave(
  filename = output_path, plot = welfare_plots,
  width = 14,   # Adjust width as needed
  height = 7,   # Adjust height as needed
  units = "in", # Units can be "in", "cm", or "mm"
  dpi = 300     # Adjust DPI for high-quality image
)
#####################
######## Grafico per rapporto tra deltacs e deltaprof
# Generare la variabile deltacs/deltaprof
totals_subset <- totals_subset %>%
  mutate(deltacs_deltaprof = ifelse(totaldeltaprof != 0, totaldeltacs / totaldeltaprof, NA))

# Grafico per deltacs/deltaprof
plot_deltacs_deltaprof <- ggplot(totals_subset, aes(x = mcchange, y = deltacs_deltaprof)) +
  geom_line(group = 1, color = "blue", size = 1) +
  geom_point(color = "blue", size = 3) +
  labs(title = "Delta CS / Delta Profit",
       x = "MCChange",
       y = "Delta CS / Delta Profit") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 0, hjust = 1))

# Grafico di passth in funzione di mcchange
plot_passth<-ggplot(average_results, aes(x = mcchange, y = passth)) +
  geom_line(color = "green", size = 1) +
  geom_point(color = "green", size = 3) +
  labs(title = "Pass-through and electric aircraft",
       x = "MCChange",
       y = "Pass-through") +
  theme_minimal()

# Scenario 400

# Disporre i due grafici in un unico layout
passth_plot_400 <- grid.arrange(plot_deltacs_deltaprof, plot_passth, ncol = 2)

# Specify the file path
output_path <- "/Users/gianmariamartini/Library/CloudStorage/Dropbox/Ricerca/settore_aereo/electric/graphs/passth_plot_400.jpeg"

# Save the combined plot
ggsave(
  filename = output_path,
  plot = passth_plot_400,
  width = 14,   # Adjust width as needed
  height = 7,   # Adjust height as needed
  units = "in", # Units can be "in", "cm", or "mm"
  dpi = 300     # Adjust DPI for high-quality image
)

# Scenario 800

# Disporre i due grafici in un unico layout
passth_plot <- grid.arrange(plot_deltacs_deltaprof, plot_passth, ncol = 2)

# Specify the file path
output_path <- "/Users/gianmariamartini/Library/CloudStorage/Dropbox/Ricerca/settore_aereo/electric/graphs/passth_plot.jpeg"

# Save the combined plot
ggsave(
  filename = output_path,
  plot = passth_plot,
  width = 14,   # Adjust width as needed
  height = 7,   # Adjust height as needed
  units = "in", # Units can be "in", "cm", or "mm"
  dpi = 300     # Adjust DPI for high-quality image
)


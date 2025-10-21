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
############### We decrease/increase marginal costs of airlines adopting electric
# aircraft under different scenarios, and we fix in any case their CO2
# equal to 0 in the demand model
theta0 = t(thetafin3)
theta0 = theta0[2,]
theta0 = as.numeric(theta0)

nd=102
ns=103
#ns=length(list_variables_supply)+1
theta_d=theta0[1:nd] # ATTENZIONE
theta_d <- as.numeric(theta_d)
theta_s=theta0[(nd+2):(nd+ns)]
theta_s <- as.numeric(theta_s)
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
    # dsdp=-(alpha/lambda)*matsk*(diag(1,nloc)*(1-matrix(c((1-lambda)*newsjg+lambda*newsj),nrow=nloc,ncol=nloc)))
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
mcvalues<-seq(0.01,0.1, by=0.1)
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

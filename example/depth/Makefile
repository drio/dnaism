REMOTE:=/stornext/snfs6/rogers/drio_scratch/projects/human.chip.on.rhesus.data/final

%.bed.gz:
	(ssh ardmore gzip -cd $(REMOTE)/$(subst .bed,,$@) | awk '{print $$1"\t"$$2"\t"$$2"\t"$$3}') | bgzip > $(subst .gz,,$@).gz;

%.tbi: %
	tabix -p bed $(subst .tbi,,$@)

# Extract a chrm from a compressed and indexed bed file
%.bed:
	id=`echo $@ | ruby -ne 'puts $$_.match(/(\d+)/)[1]'`;\
	chrm=`echo $@ | ruby -ne 'puts $$_.match(/chr(\w+)\./)[1]'`;\
	tabix $${id}.depth.gz.bed.gz Chr$$chrm > $@

list:
	@ssh ardmore ls $(REMOTE)/*depth*.gz

.PRECIOUS: %.bed.gz
.PHONY: list



import json

#####################
# Change paths here #
#####################


r_path = "/media/1tb_disk/Documents/DOCS/UOI/10o/Information_Retrieval" \
         "/Project/Data/Yelp_Dataset/review.json"
b_path = "/media/1tb_disk/Documents/DOCS/UOI/10o/Information_Retrieval/"\
          "Project/Data/Yelp_Dataset/selected_business.json"
sr_path = "/media/1tb_disk/Documents/DOCS/UOI/10o/Information_Retrieval/"\
          "Project/Data/Yelp_Dataset/selected_reviews.json"


###############################################################################
# Write to file only the reviews that have same business id with the selected #
# business of the file                                                        #
###############################################################################
def write_selected_reviews(path_b, path_r, r_dict):
    with open(path_b) as infile, open(path_r, 'w') as outfile:
        b_line = infile.readline()
        count = 0
        while b_line:
            data = json.loads(b_line)
            b_id = data['business_id']
            if b_id in r_dict.keys():
                for l in r_dict[b_id]:
                    outfile.write(l)
                    count += 1
                    print("Write number::::::: " + str(count))
            b_line = infile.readline()
        print("FINISHED!!!!!")


################################################################
# Add the reviews in a dictionary with the business_id for key #
################################################################
def group_reviews(r_path):
    rev_dict = dict()
    with open(r_path) as infile:
        line = infile.readline()
        count = 0
        while line:
            data = json.loads(line)
            b_id = data['business_id']
            if not (b_id in rev_dict.keys()):
                rev_dict[b_id] = list()

            rev_dict[b_id].append(line)
            count += 1
            print("Sorting --> " + str(count))
            line = infile.readline()
    return rev_dict


grouped_reviews = group_reviews(r_path)
write_selected_reviews(b_path, sr_path, grouped_reviews)


import json


tip_path = "/media/1tb_disk/Documents/DOCS/UOI/10o/Information_Retrieval/"\
          "Project/Data/Yelp_Dataset/tip.json"
business_path = "/media/1tb_disk/Documents/DOCS/UOI/10o/Information_Retrieval/"\
          "Project/Data/Yelp_Dataset/selected_business.json"
rev_path = "/media/1tb_disk/Documents/DOCS/UOI/10o/Information_Retrieval/"\
          "Project/Data/Yelp_Dataset/selected_reviews.json"
result_path = "/media/1tb_disk/Documents/DOCS/UOI/10o/Information_Retrieval/"\
          "Project/Data/Yelp_Dataset/merged.json"


def main():

    reviews_dict = load_reviews_to_dict(rev_path)
    tips_dict = load_tips_to_dict(tip_path)
    write_b_to_file(business_path, result_path, reviews_dict, tips_dict)


##########################################################################
# Insert in a business object all its reviews and the tips with the same #
# business_id and then write them to a new json file.                    #
##########################################################################
def write_b_to_file(b_path, out_path, r_dict, t_dict):
    with open (b_path) as infile, open(out_path, 'w') as outfile:
        business = infile.readlines()
        outfile.write("[")
        count = 0
        for b in business:
            temp = dict()
            data = json.loads(b)
            b_id = data["business_id"]
            temp["business_id"] = b_id
            temp["name"] = data["name"]
            temp["address"] = data["address"]
            temp["city"] = data["city"]
            temp["state"] = data["state"]
            temp["stars"] = str(data["stars"])
            temp["review_count"] = str(data["review_count"])
            temp["categories"] = data["categories"]
            if b_id in r_dict.keys():
                temp["reviews"] = r_dict[b_id]
            else:
                temp["reviews"] = []
            if b_id in t_dict.keys():
                temp["attributes"] = t_dict[b_id]
            else:
                temp["attributes"] = ""

            json.dump(temp, outfile)
            outfile.write(",\n")
            count += 1

            print(count)
        outfile.write("]")


####################################
# Load the reviews to a dictionary #
####################################
def load_reviews_to_dict(r_path):
    result = dict()
    with open(r_path) as infile:
        reviews = infile.readlines()
        for r in reviews:
            data = json.loads(r)
            temp = dict()
            temp["stars"] = str(data["stars"])
            temp["text"] = data["text"]
            temp["date"] = data["date"]

            if not (data["business_id"] in result.keys()):
                result[data["business_id"]] = list()

            result[data["business_id"]].append(temp)

    return result


#################################
# Load the tips in a dictionary #
#################################
def load_tips_to_dict(t_path):
    result = dict()
    with open(t_path) as infile:
        tips = infile.readlines()
        for t in tips:
            data = json.loads(t)
            result[data["business_id"]] = data["text"]
    return result


main()

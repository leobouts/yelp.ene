import json

#####################
# Change paths here #
#####################

b_path = "/media/1tb_disk/Documents/DOCS/UOI/10o/Information_Retrieval/" \
         "Project/Data/Yelp_Dataset/business.json"
r_path = "/media/1tb_disk/Documents/DOCS/UOI/10o/Information_Retrieval" \
         "/Project/Data/Yelp_Dataset/review.json"
tip_path = "/media/1tb_disk/Documents/DOCS/UOI/10o/Information_Retrieval/"\
          "Project/Data/Yelp_Dataset/tip.json"


def get_fields(path):
    with open(path) as infile:
        line = infile.readline()

        line = infile.readline()
        data = json.loads(line)
        count = 1
        for f in data:
            print(str(count) + ") " + f + " " + str(type(data[f])))
            # print((data[f]))
            count += 1


##########################################
# Get all the possible values of a field #
##########################################
def get_field_values(path, field):

    field_list = list()

    with open(path) as infile:
        line = infile.readline()
        count = 0
        while line and count != 100:
            if count == 0:
                line = line[1:-2]
            elif count == 100:
                line = line[:-3]
            else:
                line = line[:-2]

            data = json.loads(line)
            if isinstance(data[field], dict):
                for k in data[field].keys():
                    temp = data[field][k]
                    print(k)

                    if temp[0] == "{":
                        temp = str_to_dct(k, temp[1:-1])
                        print(temp)
                        print(type(temp))

            line = infile.readline()
            count += 1
            break

    return field_list


def str_to_dct(name, in_str):
    result = ""
    without_commas = in_str.split(", ")
    for i in without_commas:
        without_sc = i.split(": ")
        if without_sc[1] == "True":
            result += name + "_" + without_sc[0][1:-1] + ", "

    return result[:-2]


#################################################
# Get every 10 categories 1 until result is 100 #
#################################################
def get_random_categories(a_categories):
    count = 0
    result = list()
    for c in a_categories:
        if count == 10:
            result.append(c)
            count = 0
        if len(result) == 100:
            for r in result:
                print(r)
            return result
        count += 1


##############################################################################
# Select at least 10000 business tha fulfill the selected categories and the #
# review count is 1000000                                                    #
##############################################################################
def get_business(p, s_categories):
    b_list = list()
    b_count = 0
    r_count = 0
    with open(p) as infile:
        line = infile.readline()
        while line:
            data = json.loads(line)
            tmp = [x.strip() for x in str(data['categories']).split(',')]
            for c in tmp:
                if c in s_categories:
                    b_count += 1
                    b_list.append(line)
                    r_count += data['review_count']
                    if b_count >= 10000 and r_count >= 1000000:
                        print(b_count)
                        print(r_count)
                        return b_list
            line = infile.readline()
    return False


def write_selected_business(path, b_list):
    with open(path, 'w') as outfile:
        for b in b_list:
            outfile.write(b)
    print("SUCCESS")


######################################
# Test if the review count is right. #
######################################
def test_data(path_b, path_r):
    counter = dict()

    with open(path_r) as rev:
        reviews = rev.readlines()
        print(len(reviews))

        for r in reviews:
            data = json.loads(r)
            if data['business_id'] in counter.keys():
                counter[data['business_id']] += 1
            else:
                counter[data['business_id']] = 1
    print(len(counter.keys()))

    with open(path_b) as bus:
        business = bus.readlines()
        count = 0
        count1 = 0

        for b in business:
            data = json.loads(b)

            if data['business_id'] in counter.keys():
                if data['review_count'] != counter[data['business_id']]:
                    print(str(count1) + ")------> Business: " +
                          str(data["review_count"]) + " Reviews: " +
                          str(counter[data["business_id"]]))
                    count1 += 1
                else:
                    print(str(count) + ")$$$$$$$$$> Business: " +
                          str(data["review_count"]) + " Reviews: " +
                          str(counter[data["business_id"]]))
                    count += 1
            else:
                print("#############This business is not in the dict.")
                print(str(data["review_count"]))
                print("#############")
        print("Passed: " + str(count) + " Failed: " + str(count1))
        print("Number of business: " + str(len(business)))


##########
#  MAIN  #
##########
def get_rev_count(p):
    with open(p) as infile:

        line = infile.readlines()

        print(len(line))


# test_data(b_path, r_path)
get_fields(tip_path)

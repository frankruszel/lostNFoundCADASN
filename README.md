- Overview
    - Video of this tutorial has been created here:
        - tested with **New AWS Account + New Github Account**
    - **Customised** pipeline template script
    - SAM for deployment
    - **Supports deployment approval (optional)**
    - There are **13 steps**, for commands later, you can skip auto-filled prompts (except for github related)
- Pre-requisite:
    1. **Create IAM User Access Key** with Admin permissions
    2. Using IAM User credentials, **aws configure**
    3. **sam CLI** installed + **python** installed 
    4. **Create Github Access Key**
        1. go to:  https://github.com/settings/profile
        2. scrolldown until you see **developer settings**
            
            ![image.png](attachment:7f300212-f0ac-4106-9c81-0b9899d6b527:image.png)
            
        3. Go to (1)**Token (classic)** and click (2)**generate new token**
            
            ![image.png](attachment:73fd4466-f3af-48ba-a0cb-e28504a19971:image.png)
            
        4. Set your **Expiration** to whenever you need it for
            
            ![image.png](attachment:cc508ef8-9522-4864-9f68-6109482ef5dc:image.png)
            
        5. And tick **admin:repo_hook**
            
            ![image.png](attachment:3b27c21f-e813-4b79-9174-8358b50d1cbe:image.png)
            
        6. Scroll down and **Generate token** and save the value in a notepad (for later step)
            
            ![image.png](attachment:ee0be7c9-d494-491c-9401-0055a7c0359f:image.png)
            
- Steps
    1. **Fork repo in your Github Account:** https://github.com/frankruszel/lostNFoundCADASN
        
        ![image.png](attachment:8a246a2a-d58c-42d6-8aa5-8ba92f1c8d74:image.png)
        
    2. **git clone [cloned_repo]**
        
        ![image.png](attachment:3d129b31-5b5d-406b-88b4-32ac20c47c7a:image.png)
        
    3. **cd [cloned_repo_name]/back-end**
    4. **Delete the following:**
        1. .aws_sam [folder]
        2. pipeline [folder]
        3. codepipeline.yml [file]
    5. **sam pipeline bootstrap**
        - Answer the following lines:
            - name:  **prod**
            - Select a credential source to associate with this stage:  ***skip***
            - Select a user permissions provider:
            **1 - IAM (default)**
            2 - OpenID Connect (OIDC)
            - Enter the region in which you want these resources to be created [us-east-1]: **us-east-1**
            - Enter the pipeline execution role ARN if you have previously created one, or we will create one for you []: ***skip***
            - Enter the CloudFormation execution role ARN if you have previously created one, or we will create one for you []: ***skip***
            - Please enter the artifact bucket ARN for your Lambda function. If you do not have a bucket, we will create one for you []: ***skip***
            - Does your application contain any IMAGE type Lambda functions?: **y**
    6. **Once it compeletes,**
        1. **Update secret:**
            1. Navigate to AWS Console > Secrets Manager
            2. **Retrieve Secret Value > Edit** > **Add new row**:
                - github_access_key = [value of github access token in pre-requisite]
        2. **In template.yaml:**
            1. Update *line 26* with auto-generated **secret name**
                
                ![image.png](attachment:b334b2a2-2b6a-4a91-9d73-104929b9e36c:image.png)
                
                ![image.png](attachment:0e417bcb-17d9-4100-a021-6fc21fa8521e:image.png)
                
            2. **Comment out  lines *661 - 670*** (comment lines with *#start comment here)*
                
                ![image.png](attachment:03d9700f-cb4e-45c8-a599-00d7bf1dc2d2:image.png)
                
    7. **sam pipeline init**
        - Answer the following lines:
            - Select a pipeline template to get started: **2**  (Custom Pipeline Template Location)
            - Template Git location: [**https://github.com/frankruszel/aws-sam-cli-pipeline-init-templates.git**](https://github.com/frankruszel/aws-sam-cli-pipeline-init-templates.git)
            - Select CI/CD system: **5 - AWS CodePipeline**
            - What is subfolder path of your project from the root of the repository?: **back-end**
            - What is the SSM Prefix used to store metadata about this Monorepo? [Monorepo]: ***skip***
            - What is the Github repository name?: **lostNFoundCADASN**
            - What is the Github Account Name that owns this repository? [frankruszel]: **[Forked_Github_Account_Name]**
            - What email do you want to use for Deployment Approval?: **[your_email]**
            - What is the prefix for all the resources?: **[custom]** OR **frankcad**
            - What is the Git branch used for production deployments? [main]: ***skip***
            - What is the template file path from the project subfolder? [template.yaml]: ***skip***
            - Select an index or enter the stage configuration name (as provided during the bootstrapping): ***1***
            - What is the sam application stack name for stage 2? [sam-prod]: ***skip***
            - What is the CloudFormation stack name for this pipeline?: **stack-pipeline**
    8. **sam deploy -t codepipeline.yaml --stack-name pipeline-stack --capabilities CAPABILITY_IAM**
    9. **Once complete** (pipeline expected to be error as github connection not set)**:**
        1. **navigate to AWS Console > CodePipeline > Settings(left side nav) > Connections >:**
            
            ![image.png](attachment:821e7dea-a63c-48cf-8706-62ec0d5f82f0:image.png)
            
        2. **[Click the connection in the list] > Update pending connection**
        3. Authenticate to Github Account with Forked Repo
        4. click **Install a new app > Only select repositories > lostNFoundCADASN > Save**
            
            ![image.png](attachment:54c682b5-1716-471b-9125-86cef15953ae:image.png)
            
    10. Go to **VSC Terminal** and trigger pipeline**:**
        1. *if not in back-end folder:* **cd back-end** 
        2. **git add .** 
        3. **git commit -m “update PIpelineUserSecretKey; amplify init;”**
        4. **git push**
    11. **Once complete (3mins):**
        1. navigate **AWS Console > Cloudformation > Stacks > sam_prod > Outputs tab**
        2. click **settings icon > select ONLY Key + Value** (to update table view)
            
            ![image.png](attachment:f1378212-ea1e-42d3-b1ad-f90f31f43bf5:image.png)
            
        3. Copy the **output content**
            
            ![image.png](attachment:83a683a6-4512-43a1-ab0c-15daa58a8a96:image.png)
            
        4. Go back to VSC > open back-end/Formatter folder > **paste table values into  input.txt**
        5. navigate to **VSC Terminal:**
            1. **cd ../Formatter**
            2. **python transformToJson.py**
        6. copy output.txt  **WITHOUT** curly braces
            
            ![image.png](attachment:5c32a602-97d9-4acb-b711-4b16dcd05a8a:image.png)
            
        7. navigate to AWS Console > Secrets Manager > Secrets:
            1. click on [auto_gen_secret_link] > retrieve secret value > edit > Plaintext (view) 
            2. **append your clipboard** into the JSON secret
            3. Save
    12. **Once Secret is updated:**
        1. **In template.yaml:**
            1. **Uncomment out  lines *661 - 670*** (comment lines with *#start comment here)*
                
                ![image.png](attachment:03d9700f-cb4e-45c8-a599-00d7bf1dc2d2:image.png)
                
        2. navigate to **VSC Terminal:**
            1. **cd ..** (to go back-end directory)
            2. **git add .**
            3. **git commit -m “uncomment amplify envVar to complete;”**
            4. **git push**
    13. **YOU ARE DONE!** To go to amplify link:
        1. navigate to **AWS Console > CloudFormation > Stacks > sam-prod > Outputs tab**
        2. click ReactAppCognito**RedirectURI**
            
            ![image.png](attachment:7e737053-2418-44e9-b411-f1d82d743354:image.png)
            
            ![image.png](attachment:b16b5e88-af10-4189-bc7c-989f129abd59:image.png)

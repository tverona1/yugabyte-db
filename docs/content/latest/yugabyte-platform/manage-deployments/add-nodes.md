---
title: Use Yugabyte Platform to recover a node
headerTitle: Recover a node
linkTitle: Recover a node
description: Use Yugabyte Platform to recover a decommissioned node.
aliases:
  - /latest/manage/enterprise-edition/create-universe-multi-region
menu:
  latest:
    identifier: add-nodes
    parent: manage-deployments
    weight: 30
isTocNested: true
showAsideToc: true
---

In some cases, depending on the node's status, Yugabyte Platform allows you to recover a removed node on a new backing instance, as follows:

- Navigate to **Universes**.

- Select your universe. 

- Open the **Nodes** tab.

- Find a node with a Decommissioned status and click its corresponding **Actions > Add Node**, as per the following illustration:<br><br>

  ![Add Node Actions](/images/ee/node-actions-add-node.png)

<br> 

For Infrastructure as a service (IaaS) such as AWS and GCP, Yugabyte Platform will spawn with the existing node instance type in the existing region and zone of that node. When the process completes, the node will have the Master and TServer processes running, along with data that is load-balanced onto this node. The node's name will be reused and the status will be shown as Live. 

For information on removing and eliminating nodes, see  [Eliminate an unresponsive node](../remove-nodes/).


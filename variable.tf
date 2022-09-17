variable "vcenter-admin" {
    default = "administrator@vsphere.local"
}

variable "vcenter-admin-pass" {
    default = "QTAoHoa@T0722"
}

variable "vcenter-ip" {
    default = "10.21.188.18"
}

variable "vm-datacenter" {
    default = "Datacenter"
}

variable "vm-cluster" {
    default = "Ho-Cluster"
}

variable "vm-resource-pool" {
    default = "TEST - UAT"
}

variable "vm-datastore" {
    default = "EMC04-SSD01"
}

variable "vm-network" {
    default = "dVLAN-MGMT-8"
}

variable "vm-template" {
    default = "Temp-RHEL7-25GB-DevOps"
#    default = "Temp-RHEL7.9-25GB"

}

variable "vm-count" {
    default = 1
}

variable "vm-name" {
    default = "tes-devops0"
}

variable "vm-vcpu" {
    default = 8
}

variable "vm-ram" {
    default = 8192
#    default = 16384 # Đơn vị MB
#    default = 24576
}

variable "vm-disk-size" {
    default = 50 # Đơn vị GB
}

variable "vm-ipv4" {
    default = "10.21.188" # Khai báo 3 octet đầu của dải network đặt cho VM
}

variable "ip-host" {
    default = 172 # Đặt địa chỉ IP cho VM bắt đầu từ vm-ipv4.172. Tùy vào thực tế sửa theo giá trị mong muốn
}
variable "vm-netmask" {
    default = 24
}

variable "vm-gateway" {
    default = "10.21.188.1"
}

variable "vm-dns-server-list" {
    default = [ "10.21.190.18", "10.21.190.16" ]
}

# Khai báo password user root của Template để kết nối SSH vào VM lần đầu
variable "temp-root-pass" {
    default = "Bsc@123a"
}

# Khai báo password mới của user Root
variable "new-root-pass" {
    default = "Bsc@123a"
}

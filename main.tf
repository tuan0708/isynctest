###################################################################
# Deploy đồng thời nhiều VM từ VM/Template Linux có sẵn #
# VM tạo ra tự đặt tên, IP, extend dung lượng ổ cứng theo yêu cầu, ... #
###################################################################

# Khai báo kết nối tới VCenter
provider "vsphere" {
    user = var.vcenter-admin
    password = var.vcenter-admin-pass
    vsphere_server = var.vcenter-ip
    allow_unverified_ssl = true
}

# Khai báo Datacenter chứa VM được tạo ra trên Vcenter
data "vsphere_datacenter" "datacenter" {
    name = var.vm-datacenter
}

# Khai báo Cluster chứa VM được tạo ra trên Vcenter
data "vsphere_compute_cluster" "cluster" {
    name = var.vm-cluster
    datacenter_id = data.vsphere_datacenter.datacenter.id
}

data "vsphere_resource_pool" "resource_pool" {
    name = var.vm-resource-pool
    datacenter_id = data.vsphere_datacenter.datacenter.id
}

# Khai báo Storage chứa VM được tạo ra trên Vcenter
data "vsphere_datastore" "datastore" {
    name = var.vm-datastore
    datacenter_id = data.vsphere_datacenter.datacenter.id
}

# Khai báo Network cho VM được tạo ra trên Vcenter
data "vsphere_network" "network" {
    name = var.vm-network
    datacenter_id = data.vsphere_datacenter.datacenter.id
}

# Khai báo tên VM/Template để tiến hành deploy
data "vsphere_virtual_machine" "template" {
  name = var.vm-template
  datacenter_id = data.vsphere_datacenter.datacenter.id
}

# Bắt đầu quá trình khởi tạo VM
resource "vsphere_virtual_machine" "vm" {
    count = var.vm-count # Khai báo số lượng VM muốn deploy đồng thời
    name = "${var.vm-name}${count.index+1}" # Đặt tên cho VM được deploy theo cấu trúc, count.index bắt đầu từ 0 
#    resource_pool_id = data.vsphere_compute_cluster.cluster.resource_pool_id # Khai báo ID resource pool chứa VM, trường hợp này là đặt VM vào thẳng Cluster, ko tạo ra Resource pool riêng nên sẽ lấy Resource pool ID mặc định của Cluster
    resource_pool_id = data.vsphere_resource_pool.resource_pool.id # Khai báo ID của Resource Pool chứa VM
    datastore_id = data.vsphere_datastore.datastore.id # Khai báo ID của Datastore chứa VM
    
    num_cpus = var.vm-vcpu # Khai báo số lượng vCPU
    num_cores_per_socket = 2
    cpu_hot_add_enabled = true # Bật CPU hotadd
    memory = var.vm-ram # Khai báo RAM
    memory_hot_add_enabled = true # Bật Memory hotadd
    guest_id = data.vsphere_virtual_machine.template.guest_id # Khai báo định dạng Guest OS ID của VM chính bằng Guest OS ID của Template
    scsi_type = data.vsphere_virtual_machine.template.scsi_type # Khai báo định dạng SCSI type của VM chính bằng SCSI type của Template

    network_interface { # Khai báo network cho VM, nếu VM có nhiều card mạng thì sẽ khai báo thêm các khối network_interface {} tương tự
        network_id = data.vsphere_network.network.id # Khai báo Network ID cho VM
        adapter_type = data.vsphere_virtual_machine.template.network_interface_types[0] # Khai báo Network adapter type cho VM chính bằng Network adapter type của Template
    }

    disk { # Khai báo ổ cứng cho VM, nếu VM có nhiều ổ cứng thì sẽ khai báo thêm các khối disk {} tương tự
        label = "disk0"
        unit_number = 0
#        size = data.vsphere_virtual_machine.template.disks.0.size  # Lấy dung lượng ổ của VM bằng dung lượng ổ của Template, có thể tùy chỉnh tăng dung lượng bằng con số thực tế
        size = var.vm-disk-size # Đặt dung lượng ổ đơn vị GB
#        thin_provisioned = data.vsphere_virtual_machine.template.disks.0.thin_provisioned # Khai báo định dạng ổ cứng dạng thin theo Template
        thin_provisioned = true
    }

    clone { # Hàm Clone để clone VM hoặc deploy VM từ Template
        template_uuid = data.vsphere_virtual_machine.template.id # Khai báo UUID của Template
        customize { # Hàm Customize để thực hiện tùy chỉnh thông tin trong OS
            linux_options {
                host_name = "${var.vm-name}${count.index+1}" # Đặt tên cho VM được deploy theo cấu trúc, count.index bắt đầu từ 0
                domain    = "bsc.com.vn"
            }
            network_interface {
                ipv4_address = "${var.vm-ipv4}.${count.index+var.ip-host}" # Đặt IP cho VM được deploy theo cấu trúc, count.index bắt đầu từ 0
                ipv4_netmask = var.vm-netmask
            }
            ipv4_gateway = var.vm-gateway
            dns_server_list = var.vm-dns-server-list
        }
    }
# Khai báo chuỗi kết nối SSH vào VM để thực thi lệnh từ xa
    connection {
        type = "ssh"
        user = "root"
        password = var.temp-root-pass
        host = "${var.vm-ipv4}.${count.index+var.ip-host}"
    }

    provisioner "remote-exec" {
        inline = [
            # Đổi password root
            "(",
            "echo ${var.new-root-pass}",
            "echo ${var.new-root-pass}",
            ") | passwd",

            # Thực thi các lệnh để tăng dung lượng phân vùng thuộc sda2 (định dạng LVM) của VM
            "growpart /dev/sda 2",
            "pvresize -v /dev/sda2",

            # Mở rông phân vùng swap
            #"swapoff /dev/ol/swap", # Tắt swap
            #"lvextend -L +10G /dev/ol/swap", # Mặc định Template Temp-OL7.9 Swap 12GB, cấu hình tăng dung lượng Swap
            #"mkswap /dev/ol/swap", # Tạo swap với phân vùng vừa được extend
            #"swapon -a", # Kích hoạt swap

            # Mở rộng phân vùng root (/)
            "lvextend -l +100%FREE /dev/vg-rhel/root", # Áp dụng với Template Temp-RHEL7.9-25GB
            #"lvextend -l +100%FREE /dev/ol/root", # Extend toàn bộ dung lượng trống của disk vào phân vùng root (/). Áp dụng với Template Temp-OL7.9
            "xfs_growfs /"
        ]
    }
}
